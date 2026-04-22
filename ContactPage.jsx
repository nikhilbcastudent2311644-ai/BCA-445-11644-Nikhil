import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Phone, MapPin } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/contact`, formData);
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-16 px-6 lg:px-12 max-w-7xl mx-auto" data-testid="contact-page">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.2em] text-primary mb-4">GET IN TOUCH</p>
          <h1
            className="text-5xl md:text-6xl font-light tracking-tight mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Contact Us
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            Have questions? We're here to help and answer any questions you might have
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <Card className="p-8 border-none shadow-md">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Address</h3>
                  <p className="text-text-secondary">123 Main Street, City, State 123456, India</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-md">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Phone</h3>
                  <p className="text-text-secondary">+91 1234567890</p>
                </div>
              </div>
            </Card>

            <Card className="p-8 border-none shadow-md">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Email</h3>
                  <p className="text-text-secondary">info@nikhilresidencey.com</p>
                </div>
              </div>
            </Card>

            {/* Google Maps */}
            <div className="h-80 rounded-sm overflow-hidden shadow-md">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0977096!2d-122.40641668468164!3d37.78583297975817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sTwitter%20HQ!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hotel Location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <Card className="p-8 border-none shadow-md">
            <h2
              className="text-3xl font-light mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="contact-name-input"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="contact-email-input"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="contact-phone-input"
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  data-testid="contact-message-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-sm"
                disabled={isSubmitting}
                data-testid="submit-contact-btn"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
