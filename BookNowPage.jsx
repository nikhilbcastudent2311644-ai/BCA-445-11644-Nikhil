import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { CalendarIcon, Users } from 'lucide-react';
import { format } from 'date-fns';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BookNowPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [checkIn, setCheckIn] = useState();
  const [checkOut, setCheckOut] = useState();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    id_proof: '',
    guests: 1,
  });
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRooms();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      setRooms(response.data.rooms.filter((r) => r.available));
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  const calculateDays = () => {
    if (!checkIn || !checkOut) return 0;
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    const days = calculateDays();
    return days * selectedRoom.price;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRoom || !checkIn || !checkOut) {
      toast.error('Please select room and dates');
      return;
    }

    if (calculateDays() <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    setIsProcessing(true);

    try {
      // Create booking
      const bookingResponse = await axios.post(`${API_URL}/bookings`, {
        ...formData,
        room_id: selectedRoom.id,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        total_amount: calculateTotal(),
      });

      const bookingId = bookingResponse.data.booking_id;

      // Create payment order
      const orderResponse = await axios.post(`${API_URL}/bookings/create-order?booking_id=${bookingId}`);

      // Check if mock payment
      if (orderResponse.data.key === 'mock_key') {
        // Mock payment flow
        const mockPaymentData = {
          razorpay_order_id: orderResponse.data.order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          booking_id: bookingId,
        };

        await axios.post(`${API_URL}/bookings/verify-payment`, mockPaymentData);
        toast.success('Booking confirmed! Check your email for confirmation.');

        // Download receipt
        window.open(`${API_URL}/bookings/${bookingId}/receipt`, '_blank');

        // Reset form
        setFormData({
          customer_name: '',
          customer_email: '',
          customer_phone: '',
          id_proof: '',
          guests: 1,
        });
        setSelectedRoom(null);
        setCheckIn(undefined);
        setCheckOut(undefined);
      } else {
        // Real Razorpay payment
        const options = {
          key: orderResponse.data.key,
          amount: orderResponse.data.amount,
          currency: 'INR',
          name: 'Nikhil Residencey',
          description: `Booking for ${selectedRoom.name}`,
          order_id: orderResponse.data.order_id,
          handler: async (response) => {
            try {
              await axios.post(`${API_URL}/bookings/verify-payment`, {
                ...response,
                booking_id: bookingId,
              });
              toast.success('Payment successful! Booking confirmed.');
              window.open(`${API_URL}/bookings/${bookingId}/receipt`, '_blank');

              // Reset form
              setFormData({
                customer_name: '',
                customer_email: '',
                customer_phone: '',
                id_proof: '',
                guests: 1,
              });
              setSelectedRoom(null);
              setCheckIn(undefined);
              setCheckOut(undefined);
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          prefill: {
            name: formData.customer_name,
            email: formData.customer_email,
            contact: formData.customer_phone,
          },
          theme: {
            color: '#B8905B',
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (error) {
      toast.error('Booking failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="book-now-page">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">RESERVATIONS</p>
          <h1
            className="text-5xl md:text-6xl font-light tracking-tight mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Book Your Stay
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Choose your perfect room and reserve your dates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Available Rooms */}
          <div className="lg:col-span-2 space-y-6">
            <h2
              className="text-3xl font-light mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Available Rooms
            </h2>
            {rooms.map((room) => (
              <Card
                key={room.id}
                className={`p-6 cursor-pointer transition-all duration-300 ${
                  selectedRoom?.id === room.id
                    ? 'border-primary border-2 shadow-lg'
                    : 'border-border hover:shadow-md'
                }`}
                onClick={() => setSelectedRoom(room)}
                data-testid={`room-option-${room.id}`}
              >
                <div className="flex gap-6">
                  <img
                    src={room.image_url || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400'}
                    alt={room.name}
                    className="w-32 h-32 object-cover rounded-sm"
                  />
                  <div className="flex-1">
                    <h3
                      className="text-2xl font-light mb-2"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {room.name}
                    </h3>
                    <p className="text-sm text-text-secondary mb-2">{room.type}</p>
                    <p className="text-sm text-text-secondary mb-3">{room.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-2xl font-semibold text-primary">
                        ₹{room.price}
                        <span className="text-sm text-text-secondary font-normal">/night</span>
                      </p>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Users size={16} />
                        Up to {room.max_guests} guests
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Booking Form */}
          <div>
            <Card className="p-8 sticky top-24" data-testid="booking-form">
              <h3
                className="text-2xl font-light mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Booking Details
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="customer_name">Full Name *</Label>
                  <Input
                    id="customer_name"
                    required
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    data-testid="customer-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="customer_email">Email *</Label>
                  <Input
                    id="customer_email"
                    type="email"
                    required
                    value={formData.customer_email}
                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                    data-testid="customer-email-input"
                  />
                </div>

                <div>
                  <Label htmlFor="customer_phone">Phone *</Label>
                  <Input
                    id="customer_phone"
                    required
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                    data-testid="customer-phone-input"
                  />
                </div>

                <div>
                  <Label htmlFor="id_proof">ID Proof Number *</Label>
                  <Input
                    id="id_proof"
                    required
                    placeholder="Aadhaar / PAN / Passport"
                    value={formData.id_proof}
                    onChange={(e) => setFormData({ ...formData, id_proof: e.target.value })}
                    data-testid="id-proof-input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Check-in *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          data-testid="check-in-button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkIn ? format(checkIn, 'MMM dd, yyyy') : 'Select'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={checkIn} onSelect={setCheckIn} />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Check-out *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left"
                          data-testid="check-out-button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOut ? format(checkOut, 'MMM dd, yyyy') : 'Select'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={checkOut} onSelect={setCheckOut} />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="guests">Number of Guests *</Label>
                  <Select
                    value={formData.guests.toString()}
                    onValueChange={(value) => setFormData({ ...formData, guests: parseInt(value) })}
                  >
                    <SelectTrigger data-testid="guests-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} Guest{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedRoom && checkIn && checkOut && calculateDays() > 0 && (
                  <div className="p-4 bg-surface-secondary rounded-sm">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-text-secondary">Room</span>
                      <span className="text-sm font-medium">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-text-secondary">Nights</span>
                      <span className="text-sm font-medium">{calculateDays()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="font-semibold">Total Amount</span>
                      <span className="text-xl font-semibold text-primary">₹{calculateTotal()}</span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-sm"
                  disabled={isProcessing || !selectedRoom}
                  data-testid="submit-booking-btn"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookNowPage;
