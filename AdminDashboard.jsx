import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Card } from '@/components/ui/card';
import { BedDouble, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchAnalytics();
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${API_URL}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  const stats = [
    {
      icon: BedDouble,
      label: 'Total Rooms',
      value: analytics?.total_rooms || 0,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: BedDouble,
      label: 'Available Rooms',
      value: analytics?.available_rooms || 0,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: Calendar,
      label: 'Booked Rooms',
      value: analytics?.booked_rooms || 0,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
    {
      icon: Calendar,
      label: 'Total Bookings',
      value: analytics?.total_bookings || 0,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
  ];

  const financialStats = [
    {
      icon: DollarSign,
      label: 'Revenue',
      value: `₹${analytics?.revenue?.toFixed(2) || 0}`,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: TrendingUp,
      label: 'Profit',
      value: `₹${analytics?.profit?.toFixed(2) || 0}`,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: TrendingDown,
      label: 'Expenses',
      value: `₹${analytics?.expenses?.toFixed(2) || 0}`,
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
    {
      icon: TrendingDown,
      label: 'Burn Rate',
      value: `₹${analytics?.burn_rate?.toFixed(2) || 0}`,
      color: 'text-orange-600',
      bg: 'bg-orange-100',
    },
  ];

  return (
    <AdminLayout>
      <div data-testid="admin-dashboard">
        <h1
          className="text-4xl font-light mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Dashboard Overview
        </h1>

        <div className="space-y-8">
          {/* Room Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Room Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={stat.color} size={28} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Financial Statistics */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Financial Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {financialStats.map((stat, idx) => (
                <Card key={idx} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-14 h-14 rounded-full ${stat.bg} flex items-center justify-center`}>
                      <stat.icon className={stat.color} size={28} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
