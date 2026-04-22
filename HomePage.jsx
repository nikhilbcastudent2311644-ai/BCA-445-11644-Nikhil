import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Wifi, Car, Coffee, Shield, Utensils } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchRooms();
    fetchReviews();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      setRooms(response.data.rooms.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews?limit=3`);
      setReviews(response.data.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1766160703850-b3a2ccb78d2a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxNzV8MHwxfHNlYXJjaHwzfHxsdXh1cnklMjBob3RlbCUyMGV4dGVyaW9yfGVufDB8fHx8MTc3NDI3MTg3N3ww&ixlib=rb-4.1.0&q=85)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        data-testid="hero-section"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
            data-testid="hero-title"
          >
            Welcome to Nikhil Residencey
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed">
            Experience luxury, comfort, and hospitality like never before
          </p>
          <Button
            onClick={() => navigate('/book')}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-sm transition-transform duration-300 hover:scale-105"
            data-testid="hero-book-now-btn"
          >
            Book Your Stay
          </Button>
        </div>
      </section>

      {/* Services Highlights */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">WHAT WE OFFER</p>
          <h2
            className="text-4xl md:text-5xl font-light tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Hotel Services
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {[
            { icon: Wifi, label: 'Free WiFi' },
            { icon: Car, label: 'Parking' },
            { icon: Utensils, label: 'Restaurant' },
            { icon: Coffee, label: 'Room Service' },
            { icon: Shield, label: 'Security' },
            { icon: Star, label: 'Premium' },
          ].map((service, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center space-y-4 p-6 rounded-sm hover:bg-surface-secondary transition-colors duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <service.icon size={28} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-text-primary">{service.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto bg-surface-secondary">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">ROOMS & SUITES</p>
          <h2
            className="text-4xl md:text-5xl font-light tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Featured Rooms
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="featured-rooms">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow duration-300"
              data-testid={`room-card-${room.id}`}
            >
              <div className="relative h-64">
                <img
                  src={room.image_url || 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600'}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute top-4 right-4 px-3 py-1 rounded-sm text-xs font-semibold ${
                    room.available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}
                >
                  {room.available ? 'Available' : 'Full'}
                </div>
              </div>
              <div className="p-6">
                <h3
                  className="text-2xl font-light mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {room.name}
                </h3>
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{room.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-semibold text-primary">
                    ₹{room.price}
                    <span className="text-sm text-text-secondary font-normal">/night</span>
                  </p>
                  <Button
                    onClick={() => navigate('/book')}
                    className="bg-secondary hover:bg-secondary/90 text-white rounded-sm"
                    data-testid={`book-room-${room.id}`}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            onClick={() => navigate('/book')}
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary hover:text-white rounded-sm transition-colors duration-300"
          >
            View All Rooms
          </Button>
        </div>
      </section>

      {/* Reviews Preview */}
      {reviews.length > 0 && (
        <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">TESTIMONIALS</p>
            <h2
              className="text-4xl md:text-5xl font-light tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              What Our Guests Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="reviews-section">
            {reviews.map((review) => (
              <Card key={review.id} className="p-8 border-none bg-white shadow-md">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < review.rating ? 'text-primary fill-primary' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <p className="text-sm text-text-secondary mb-4 line-clamp-4">{review.comment}</p>
                <p className="text-sm font-semibold text-text-primary">{review.customer_name}</p>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24 px-6 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-4xl md:text-5xl font-light tracking-tight mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Ready to Experience Luxury?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Book your stay today and create unforgettable memories
          </p>
          <Button
            onClick={() => navigate('/book')}
            size="lg"
            className="bg-white text-primary hover:bg-white/90 px-8 py-6 text-lg rounded-sm transition-transform duration-300 hover:scale-105"
            data-testid="cta-book-now-btn"
          >
            Book Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
