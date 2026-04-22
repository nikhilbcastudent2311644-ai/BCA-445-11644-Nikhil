import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Extract unique customers
      const uniqueCustomers = [];
      const customerMap = new Map();

      response.data.bookings.forEach((booking) => {
        const key = booking.customer_email;
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: booking.customer_name,
            email: booking.customer_email,
            phone: booking.customer_phone,
            bookings: [],
          });
          uniqueCustomers.push(customerMap.get(key));
        }
        customerMap.get(key).bookings.push(booking);
      });

      setCustomers(uniqueCustomers);
      setBookings(response.data.bookings);
    } catch (error) {
      toast.error('Failed to fetch customers');
    }
  };

  return (
    <AdminLayout>
      <div data-testid="customer-management-page">
        <h1
          className="text-4xl font-light mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Customer Management
        </h1>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Bookings</TableHead>
                <TableHead>Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer, idx) => {
                const totalSpent = customer.bookings
                  .filter((b) => b.payment_status === 'completed')
                  .reduce((sum, b) => sum + b.total_amount, 0);

                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.bookings.length}</TableCell>
                    <TableCell>₹{totalSpent.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CustomerManagement;
