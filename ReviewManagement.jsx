import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Star, Trash2 } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ReviewManagement = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchReviews();
  }, [navigate]);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(`${API_URL}/reviews`);
      setReviews(response.data.reviews);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    const token = localStorage.getItem('admin_token');
    try {
      await axios.delete(`${API_URL}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <AdminLayout>
      <div data-testid="review-management-page">
        <h1
          className="text-4xl font-light mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Review Management
        </h1>

        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{review.customer_name}</p>
                      <p className="text-xs text-text-secondary">{review.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < review.rating ? 'text-primary fill-primary' : 'text-gray-300'}
                        />
                      ))}
                      <span className="ml-2 text-sm font-medium">{review.rating}/5</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="line-clamp-2 text-sm">{review.comment}</p>
                  </TableCell>
                  <TableCell>{new Date(review.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id)}
                      data-testid={`delete-review-${review.id}`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ReviewManagement;
