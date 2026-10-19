import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Calendar, DollarSign, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import bookingApi from '../../api/bookingApi';
import CustomerBookingsTab from './tabs/CustomerBookingsTab';
import CustomerSpendingTab from './tabs/CustomerSpendingTab';
import CustomerSettingsTab from './tabs/CustomerSettingsTab';

const CustomerProfile = () => {
  const { user, login } = useAuth();
  const [currentUser, setCurrentUser] = useState(user);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'spending' | 'settings'

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingApi.getBookings();
      setBookings(data || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    setCurrentUser(user);
  }, [user]);

  const handleUserUpdated = (updated) => {
    setCurrentUser(updated);
    if (login) {
      login(localStorage.getItem('token'), updated);
    }
  };

  const customerNav = [
    {
      key: 'bookings',
      label: 'Lịch sử đơn dịch vụ',
      icon: Calendar,
      badge: bookings.length > 0 ? `${bookings.length}` : null,
      active: activeTab === 'bookings',
      onClick: () => setActiveTab('bookings'),
    },
    {
      key: 'spending',
      label: 'Thống kê chi tiêu',
      icon: DollarSign,
      active: activeTab === 'spending',
      onClick: () => setActiveTab('spending'),
    },
    {
      key: 'settings',
      label: 'Cài đặt tài khoản',
      icon: User,
      active: activeTab === 'settings',
      onClick: () => setActiveTab('settings'),
    },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'bookings': return 'Lịch sử đơn dịch vụ';
      case 'spending': return 'Thống kê chi tiêu';
      case 'settings': return 'Cài đặt tài khoản & Địa chỉ';
      default: return 'Trang khách hàng';
    }
  };

  return (
    <DashboardLayout 
      roleBadge="Khách hàng"
      roleColor="blue"
      sidebarNav={customerNav}
      activeTab={activeTab}
      onTabChange={(tabKey) => setActiveTab(tabKey)}
      pageTitle={getPageTitle()}
      pageSubtitle="Theo dõi đơn hàng, quản lý chi phí và cập nhật thông tin"
    >
      <div className="space-y-6">

        {/* Tab Content */}
        {activeTab === 'bookings' && (
          <CustomerBookingsTab
            bookings={bookings}
            isLoading={isLoading}
            fetchBookings={fetchBookings}
          />
        )}

        {activeTab === 'spending' && (
          <CustomerSpendingTab />
        )}

        {activeTab === 'settings' && (
          <CustomerSettingsTab
            currentUser={currentUser}
            onUserUpdated={handleUserUpdated}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CustomerProfile;
