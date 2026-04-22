from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Form, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import razorpay
import resend
import asyncio
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_RIGHT, TA_CENTER
from decimal import Decimal

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Models
class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class RoomCreate(BaseModel):
    name: str
    type: str
    description: str
    price: float
    image_url: Optional[str] = None
    amenities: List[str] = []
    max_guests: int = 2
    available: bool = True

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    image_url: Optional[str] = None
    amenities: Optional[List[str]] = None
    max_guests: Optional[int] = None
    available: Optional[bool] = None

class BookingCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    id_proof: str
    room_id: str
    check_in: str
    check_out: str
    guests: int
    total_amount: float

class PaymentVerification(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: str

class ReviewCreate(BaseModel):
    room_id: str
    customer_name: str
    customer_email: EmailStr
    rating: int
    comment: str

    @field_validator('rating')
    def validate_rating(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: str

class HotelSettings(BaseModel):
    hotel_name: str
    hotel_email: EmailStr
    hotel_phone: str
    hotel_address: str
    description: Optional[str] = None

class AdminPasswordChange(BaseModel):
    current_password: str
    new_password: str

# Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = payload.get("sub")
        if admin_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        admin = await db.admins.find_one({"id": admin_id}, {"_id": 0})
        if admin is None:
            raise HTTPException(status_code=401, detail="Admin not found")
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_pdf_receipt(booking_data: dict) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=30, leftMargin=30, topMargin=30, bottomMargin=30)
    
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#B8905B'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    story.append(Paragraph("Nikhil Residencey", title_style))
    story.append(Paragraph("BOOKING RECEIPT", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    # Booking details
    details_data = [
        ['Booking ID:', booking_data.get('booking_id', 'N/A')],
        ['Customer Name:', booking_data.get('customer_name', 'N/A')],
        ['Email:', booking_data.get('customer_email', 'N/A')],
        ['Phone:', booking_data.get('customer_phone', 'N/A')],
        ['Room:', booking_data.get('room_name', 'N/A')],
        ['Check-in:', booking_data.get('check_in', 'N/A')],
        ['Check-out:', booking_data.get('check_out', 'N/A')],
        ['Guests:', str(booking_data.get('guests', 0))],
        ['Total Amount:', f"₹{booking_data.get('total_amount', 0):.2f}"],
        ['Payment Status:', booking_data.get('payment_status', 'Pending')],
        ['Booking Date:', booking_data.get('created_at', 'N/A')],
    ]
    
    details_table = Table(details_data, colWidths=[2*inch, 4*inch])
    details_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(details_table)
    story.append(Spacer(1, 20))
    
    footer_text = "Thank you for choosing Nikhil Residencey!"
    story.append(Paragraph(footer_text, ParagraphStyle(
        name='Footer',
        fontSize=10,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#666666')
    )))
    
    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

# Routes
@api_router.get("/")
async def root():
    return {"message": "Nikhil Residencey API", "status": "running"}

# Admin Routes
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    if not admin or not verify_password(login_data.password, admin['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token({"sub": admin['id'], "email": admin['email']})
    return {
        "token": token,
        "admin": {"id": admin['id'], "email": admin['email'], "name": admin['name']}
    }

@api_router.post("/admin/register")
async def admin_register(admin_data: AdminCreate):
    existing = await db.admins.find_one({"email": admin_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    admin = {
        "id": str(uuid.uuid4()),
        "email": admin_data.email,
        "password": hash_password(admin_data.password),
        "name": admin_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admins.insert_one(admin)
    return {"message": "Admin created successfully", "id": admin['id']}

@api_router.get("/admin/profile")
async def get_admin_profile(admin = Depends(get_current_admin)):
    return {"id": admin['id'], "email": admin['email'], "name": admin['name']}

@api_router.post("/admin/change-password")
async def change_admin_password(password_data: AdminPasswordChange, admin = Depends(get_current_admin)):
    if not verify_password(password_data.current_password, admin['password']):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_hash = hash_password(password_data.new_password)
    await db.admins.update_one({"id": admin['id']}, {"$set": {"password": new_hash}})
    return {"message": "Password changed successfully"}

# Room Routes
@api_router.get("/rooms")
async def get_rooms():
    rooms = await db.rooms.find({}, {"_id": 0}).to_list(100)
    return {"rooms": rooms}

@api_router.post("/rooms", dependencies=[Depends(get_current_admin)])
async def create_room(room: RoomCreate):
    room_data = {
        "id": str(uuid.uuid4()),
        **room.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.rooms.insert_one(room_data)
    return {"message": "Room created", "id": room_data['id']}

@api_router.put("/rooms/{room_id}", dependencies=[Depends(get_current_admin)])
async def update_room(room_id: str, room: RoomUpdate):
    update_data = {k: v for k, v in room.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    result = await db.rooms.update_one({"id": room_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room updated"}

@api_router.delete("/rooms/{room_id}", dependencies=[Depends(get_current_admin)])
async def delete_room(room_id: str):
    result = await db.rooms.delete_one({"id": room_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room deleted"}

# Booking Routes
@api_router.post("/bookings")
async def create_booking(booking: BookingCreate):
    room = await db.rooms.find_one({"id": booking.room_id}, {"_id": 0})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    booking_data = {
        "id": str(uuid.uuid4()),
        **booking.model_dump(),
        "room_name": room['name'],
        "payment_status": "pending",
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.bookings.insert_one(booking_data)
    return {"booking_id": booking_data['id'], "booking": {k: v for k, v in booking_data.items() if k != '_id'}}

@api_router.post("/bookings/create-order")
async def create_payment_order(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID')
    razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
    
    if not razorpay_key_id or not razorpay_key_secret:
        # Mock order for testing
        order_id = f"order_mock_{uuid.uuid4().hex[:12]}"
        return {
            "order_id": order_id,
            "amount": int(booking['total_amount'] * 100),
            "currency": "INR",
            "key": "mock_key"
        }
    
    try:
        razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret))
        order = razorpay_client.order.create({
            "amount": int(booking['total_amount'] * 100),
            "currency": "INR",
            "receipt": booking_id[:40],
            "payment_capture": 1
        })
        return {**order, "key": razorpay_key_id}
    except Exception as e:
        logger.error(f"Razorpay order creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Payment order creation failed")

@api_router.post("/bookings/verify-payment")
async def verify_payment(payment_data: PaymentVerification):
    booking = await db.bookings.find_one({"id": payment_data.booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
    
    if not razorpay_key_secret or payment_data.razorpay_order_id.startswith('order_mock'):
        # Mock verification
        await db.bookings.update_one(
            {"id": payment_data.booking_id},
            {"$set": {
                "payment_status": "completed",
                "status": "confirmed",
                "payment_id": payment_data.razorpay_payment_id,
                "order_id": payment_data.razorpay_order_id
            }}
        )
    else:
        try:
            razorpay_client = razorpay.Client(auth=(os.environ.get('RAZORPAY_KEY_ID'), razorpay_key_secret))
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id': payment_data.razorpay_order_id,
                'razorpay_payment_id': payment_data.razorpay_payment_id,
                'razorpay_signature': payment_data.razorpay_signature
            })
            await db.bookings.update_one(
                {"id": payment_data.booking_id},
                {"$set": {
                    "payment_status": "completed",
                    "status": "confirmed",
                    "payment_id": payment_data.razorpay_payment_id,
                    "order_id": payment_data.razorpay_order_id
                }}
            )
        except Exception as e:
            logger.error(f"Payment verification failed: {str(e)}")
            raise HTTPException(status_code=400, detail="Payment verification failed")
    
    # Send confirmation email
    updated_booking = await db.bookings.find_one({"id": payment_data.booking_id}, {"_id": 0})
    await send_booking_confirmation_email(updated_booking)
    
    return {"message": "Payment verified", "booking": updated_booking}

async def send_booking_confirmation_email(booking: dict):
    resend_api_key = os.environ.get('RESEND_API_KEY')
    if not resend_api_key:
        logger.warning("Resend API key not configured, skipping email")
        return
    
    try:
        resend.api_key = resend_api_key
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #B8905B; color: white; padding: 20px; text-align: center;">
                <h1>Booking Confirmed!</h1>
            </div>
            <div style="padding: 20px; background: #f9f9f9;">
                <h2>Dear {booking['customer_name']},</h2>
                <p>Your booking at Nikhil Residencey has been confirmed.</p>
                <h3>Booking Details:</h3>
                <ul>
                    <li><strong>Booking ID:</strong> {booking['id']}</li>
                    <li><strong>Room:</strong> {booking['room_name']}</li>
                    <li><strong>Check-in:</strong> {booking['check_in']}</li>
                    <li><strong>Check-out:</strong> {booking['check_out']}</li>
                    <li><strong>Guests:</strong> {booking['guests']}</li>
                    <li><strong>Total Amount:</strong> ₹{booking['total_amount']}</li>
                </ul>
                <p>We look forward to welcoming you!</p>
                <p style="color: #666; font-size: 12px; margin-top: 30px;">This is an automated email. Please do not reply.</p>
            </div>
        </body>
        </html>
        """
        
        params = {
            "from": "Nikhil Residencey <onboarding@resend.dev>",
            "to": [booking['customer_email']],
            "subject": f"Booking Confirmation - {booking['id']}",
            "html": html_content
        }
        
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Confirmation email sent to {booking['customer_email']}")
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {str(e)}")

@api_router.get("/bookings")
async def get_bookings(admin = Depends(get_current_admin)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"bookings": bookings}

@api_router.get("/bookings/{booking_id}")
async def get_booking(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking

@api_router.delete("/bookings/{booking_id}", dependencies=[Depends(get_current_admin)])
async def cancel_booking(booking_id: str):
    result = await db.bookings.update_one({"id": booking_id}, {"$set": {"status": "cancelled"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"message": "Booking cancelled"}

@api_router.get("/bookings/{booking_id}/receipt")
async def download_receipt(booking_id: str):
    booking = await db.bookings.find_one({"id": booking_id}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    if booking['payment_status'] != 'completed':
        raise HTTPException(status_code=400, detail="Payment not completed")
    
    pdf_data = {
        "booking_id": booking['id'],
        "customer_name": booking['customer_name'],
        "customer_email": booking['customer_email'],
        "customer_phone": booking['customer_phone'],
        "room_name": booking['room_name'],
        "check_in": booking['check_in'],
        "check_out": booking['check_out'],
        "guests": booking['guests'],
        "total_amount": booking['total_amount'],
        "payment_status": booking['payment_status'],
        "created_at": booking['created_at']
    }
    
    pdf_bytes = generate_pdf_receipt(pdf_data)
    
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="receipt-{booking_id}.pdf"'}
    )

# Review Routes
@api_router.post("/reviews")
async def create_review(review: ReviewCreate):
    room = await db.rooms.find_one({"id": review.room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    review_data = {
        "id": str(uuid.uuid4()),
        **review.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review_data)
    return {"message": "Review submitted", "id": review_data['id']}

@api_router.get("/reviews")
async def get_reviews(room_id: Optional[str] = None, limit: int = 100):
    query = {"room_id": room_id} if room_id else {}
    reviews = await db.reviews.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return {"reviews": reviews}

@api_router.delete("/reviews/{review_id}", dependencies=[Depends(get_current_admin)])
async def delete_review(review_id: str):
    result = await db.reviews.delete_one({"id": review_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Review not found")
    return {"message": "Review deleted"}

# Contact Routes
@api_router.post("/contact")
async def create_contact_message(message: ContactMessage):
    message_data = {
        "id": str(uuid.uuid4()),
        **message.model_dump(),
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contact_messages.insert_one(message_data)
    return {"message": "Message sent successfully"}

@api_router.get("/contact", dependencies=[Depends(get_current_admin)])
async def get_contact_messages():
    messages = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"messages": messages}

# Hotel Settings
@api_router.get("/settings")
async def get_hotel_settings():
    settings = await db.settings.find_one({"type": "hotel"}, {"_id": 0})
    if not settings:
        return {
            "hotel_name": "Nikhil Residencey",
            "hotel_email": "info@nikhilresidencey.com",
            "hotel_phone": "+91 1234567890",
            "hotel_address": "123 Main Street, City, State 123456, India",
            "description": "Experience luxury and comfort at Nikhil Residencey"
        }
    return settings

@api_router.put("/settings", dependencies=[Depends(get_current_admin)])
async def update_hotel_settings(settings: HotelSettings):
    settings_data = {"type": "hotel", **settings.model_dump()}
    await db.settings.update_one({"type": "hotel"}, {"$set": settings_data}, upsert=True)
    return {"message": "Settings updated"}

# Analytics
@api_router.get("/analytics", dependencies=[Depends(get_current_admin)])
async def get_analytics():
    total_rooms = await db.rooms.count_documents({})
    available_rooms = await db.rooms.count_documents({"available": True})
    total_bookings = await db.bookings.count_documents({})
    confirmed_bookings = await db.bookings.count_documents({"status": "confirmed"})
    
    # Calculate revenue
    bookings = await db.bookings.find({"payment_status": "completed"}, {"_id": 0, "total_amount": 1}).to_list(10000)
    revenue = sum(b['total_amount'] for b in bookings)
    
    return {
        "total_rooms": total_rooms,
        "available_rooms": available_rooms,
        "booked_rooms": total_rooms - available_rooms,
        "total_bookings": total_bookings,
        "confirmed_bookings": confirmed_bookings,
        "revenue": revenue,
        "profit": revenue * 0.3,
        "expenses": revenue * 0.5,
        "burn_rate": revenue * 0.2
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
