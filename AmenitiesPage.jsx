import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Wifi, Car, Coffee, Shield, Utensils, Wind } from 'lucide-react';

const AmenitiesPage = () => {
  const amenities = [
    {
      icon: Wifi,
      title: 'Free WiFi',
      description: 'High-speed internet access throughout the property',
      image: 'https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
      icon: Wind,
      title: 'AC Rooms',
      description: 'Climate-controlled rooms for your comfort',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600',
    },
    {
      icon: Car,
      title: 'Parking',
      description: 'Secure parking facility for all guests',
      image: 'https://images.pexels.com/photos/3510073/pexels-photo-3510073.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
      icon: Utensils,
      title: 'Restaurant',
      description: 'Fine dining with local and international cuisine',
      image: 'https://images.pexels.com/photos/2290753/pexels-photo-2290753.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
      icon: Coffee,
      title: 'Room Service',
      description: '24/7 room service for your convenience',
      image: 'https://images.pexels.com/photos/6466284/pexels-photo-6466284.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Round-the-clock security for your safety',
      image: 'https://images.pexels.com/photos/7821345/pexels-photo-7821345.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="amenities-page">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">HOTEL FACILITIES</p>
          <h1
            className="text-5xl md:text-6xl font-light tracking-tight mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Our Amenities
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Experience world-class facilities and services designed for your comfort and convenience
          </p>
        </div>

        {/* Amenities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {amenities.map((amenity, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-sm shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid={`amenity-${amenity.title.toLowerCase().replace(/ /g, '-')}`}
            >
              <div className="relative h-80">
                <img
                  src={amenity.image}
                  alt={amenity.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center mb-4">
                  <amenity.icon size={24} />
                </div>
                <h3
                  className="text-2xl font-light mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {amenity.title}
                </h3>
                <p className="text-sm text-white/90">{amenity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AmenitiesPage;
