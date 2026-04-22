import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import HomePage from '@/pages/HomePage';
import AmenitiesPage from '@/pages/AmenitiesPage';
import GalleryPage from '@/pages/GalleryPage';
import BookNowPage from '@/pages/BookNowPage';
import ContactPage from '@/pages/ContactPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import RoomManagement from '@/pages/admin/RoomManagement';
import BookingManagement from '@/pages/admin/BookingManagement';
import CustomerManagement from '@/pages/admin/CustomerManagement';
import ReviewManagement from '@/pages/admin/ReviewManagement';
import AdminSettings from '@/pages/admin/AdminSettings';
import '@/App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/amenities" element={<AmenitiesPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/book" element={<BookNowPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<RoomManagement />} />
          <Route path="/admin/bookings" element={<BookingManagement />} />
          <Route path="/admin/customers" element={<CustomerManagement />} />
          <Route path="/admin/reviews" element={<ReviewManagement />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
