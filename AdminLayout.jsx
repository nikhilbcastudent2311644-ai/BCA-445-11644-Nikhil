import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BedDouble, Calendar, Users, MessageSquare, Settings, LogOut } from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_info');
    navigate('/admin/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: BedDouble, label: 'Rooms', path: '/admin/rooms' },
    { icon: Calendar, label: 'Bookings', path: '/admin/bookings' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: MessageSquare, label: 'Reviews', path: '/admin/reviews' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground flex flex-col" data-testid="admin-sidebar">
        <div className="p-6">
          <h1
            className="text-2xl font-light"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#B8905B' }}
          >
            Nikhil Residencey
          </h1>
          <p className="text-xs text-secondary-foreground/60 mt-1">Admin Panel</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-sm transition-colors duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary text-white'
                  : 'text-secondary-foreground/80 hover:bg-secondary-foreground/10'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start text-secondary-foreground border-secondary-foreground/20 hover:bg-secondary-foreground/10"
            data-testid="logout-btn"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
