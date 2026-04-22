import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground" data-testid="footer">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* About */}
          <div>
            <h3
              className="text-2xl font-light mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: '#B8905B' }}
            >
              Nikhil Residencey
            </h3>
            <p className="text-sm text-secondary-foreground/80 leading-relaxed">
              Experience luxury and comfort at Nikhil Residencey. Your home away from home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Quick Links
            </h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm hover:text-primary transition-colors duration-300">
                Home
              </Link>
              <Link to="/amenities" className="block text-sm hover:text-primary transition-colors duration-300">
                Amenities
              </Link>
              <Link to="/gallery" className="block text-sm hover:text-primary transition-colors duration-300">
                Gallery
              </Link>
              <Link to="/book" className="block text-sm hover:text-primary transition-colors duration-300">
                Book Now
              </Link>
              <Link to="/contact" className="block text-sm hover:text-primary transition-colors duration-300">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Contact Info
            </h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary mt-1 flex-shrink-0" />
                <p className="text-sm text-secondary-foreground/80">
                  123 Main Street, City, State 123456, India
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-primary flex-shrink-0" />
                <p className="text-sm text-secondary-foreground/80">+91 1234567890</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-primary flex-shrink-0" />
                <p className="text-sm text-secondary-foreground/80">info@nikhilresidencey.com</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-12 pt-8 text-center">
          <p className="text-sm text-secondary-foreground/60">
            © {new Date().getFullYear()} Nikhil Residencey. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
