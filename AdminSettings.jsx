import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSettings = () => {
  const navigate = useNavigate();
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
  }, [navigate]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');

    try {
      await axios.post(`${API_URL}/admin/change-password`, passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <AdminLayout>
      <div data-testid="admin-settings-page">
        <h1
          className="text-4xl font-light mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          Settings
        </h1>

        <div className="max-w-2xl space-y-8">
          {/* Profile Info */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="text-lg">{JSON.parse(localStorage.getItem('admin_info') || '{}').name}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-lg">{JSON.parse(localStorage.getItem('admin_info') || '{}').email}</p>
              </div>
            </div>
          </Card>

          {/* Change Password */}
          <Card className="p-8">
            <h2 className="text-2xl font-semibold mb-6">Change Password</h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  required
                  value={passwordData.current_password}
                  onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                  data-testid="current-password-input"
                />
              </div>
              <div>
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  data-testid="new-password-input"
                />
              </div>
              <Button type="submit" className="bg-primary hover:bg-primary/90" data-testid="change-password-btn">
                Change Password
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
