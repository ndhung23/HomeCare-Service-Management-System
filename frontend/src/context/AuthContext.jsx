import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'admin': return '/admin';
    case 'enterprise': return '/enterprise';
    case 'helper': return '/helper';
    case 'customer':
    default: return '/customer';
  }
};

export const MOCK_ACCOUNTS = [
  {
    role: 'admin',
    label: 'Admin',
    name: 'Quản Trị Viên (Admin)',
    email: 'admin@giupviec24.vn',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    redirectPath: '/admin',
    dashboardPath: '/admin',
    roleName: 'Quản trị hệ thống',
  },
  {
    role: 'enterprise',
    label: 'Doanh nghiệp',
    name: 'Công ty Dịch vụ CleanPro',
    email: 'dn@cleanpro.vn',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
    redirectPath: '/enterprise',
    dashboardPath: '/enterprise',
    roleName: 'Đối tác doanh nghiệp',
  },
  {
    role: 'helper',
    label: 'Người giúp việc',
    name: 'Nguyễn Thị Lan (Giúp việc)',
    email: 'lan.nguyen@giupviec24.vn',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    redirectPath: '/helper',
    dashboardPath: '/helper',
    roleName: 'Cộng tác viên giúp việc',
  },
  {
    role: 'customer',
    label: 'Khách hàng',
    name: 'Trần Văn Hoàng (Khách hàng)',
    email: 'khachhang@gmail.com',
    password: '123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    redirectPath: '/', // Customer stays at Home upon login
    dashboardPath: '/customer', // Trang quản lý của customer là /customer
    roleName: 'Khách hàng',
  },
];

const INITIAL_BOOKINGS = [
  {
    id: 'BK-101',
    service: 'Dọn dẹp nhà theo giờ',
    helper: 'Nguyễn Thị Lan',
    date: '26/09/2026',
    time: '14:00 - 17:00 (3 tiếng)',
    address: 'Căn 1204, Vinhomes D’Capitale, Cầu Giấy, Hà Nội',
    price: '360.000đ',
    status: 'Đã hoàn thành',
    statusColor: 'emerald',
  },
  {
    id: 'BK-102',
    service: 'Nấu ăn gia đình',
    helper: 'Lê Thị Mai',
    date: '28/09/2026',
    time: '17:30 - 19:30 (2 tiếng)',
    address: 'Số 18 ngõ 86 Duy Tân, Cầu Giấy, Hà Nội',
    price: '280.000đ',
    status: 'Sắp diễn ra',
    statusColor: 'blue',
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('giupviec24_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [bookings, setBookings] = useState(() => {
    try {
      const savedBookings = localStorage.getItem('giupviec24_bookings');
      return savedBookings ? JSON.parse(savedBookings) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('giupviec24_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('giupviec24_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('giupviec24_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Mock login: match email or quick-login by role
  const login = (emailOrRole, password = '') => {
    let matched = MOCK_ACCOUNTS.find(
      acc => acc.role === emailOrRole || acc.email.toLowerCase() === emailOrRole.toLowerCase()
    );

    if (!matched) {
      matched = {
        role: 'customer',
        name: emailOrRole.split('@')[0] || 'Khách hàng',
        email: emailOrRole,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        redirectPath: '/', // Customer stays at Home
        dashboardPath: '/customer',
        roleName: 'Khách hàng',
      };
    } else if (matched.role === 'customer') {
      matched.redirectPath = '/';
      matched.dashboardPath = '/customer';
    } else {
      matched.dashboardPath = getRoleDashboardPath(matched.role);
    }

    setUser(matched);
    return matched;
  };

  const register = (userData) => {
    const role = userData.role || 'customer';
    const roleRoutes = {
      admin: '/admin',
      enterprise: '/enterprise',
      helper: '/helper',
      customer: '/', // Customer goes to Home
    };

    const newUser = {
      role: role,
      name: userData.fullName || 'Người dùng mới',
      email: userData.email,
      phone: userData.phone || '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      redirectPath: roleRoutes[role] || '/',
      dashboardPath: getRoleDashboardPath(role),
      roleName: 
        role === 'admin' ? 'Quản trị viên' :
        role === 'enterprise' ? 'Đối tác doanh nghiệp' :
        role === 'helper' ? 'Cộng tác viên giúp việc' : 'Khách hàng',
    };

    setUser(newUser);
    return newUser;
  };

  const addBooking = (bookingData) => {
    const newEntry = {
      id: `BK-${Date.now().toString().slice(-4)}`,
      status: 'Chờ người nhận',
      statusColor: 'amber',
      ...bookingData,
    };
    setBookings(prev => [newEntry, ...prev]);
    return newEntry;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      bookings, 
      addBooking, 
      getRoleDashboardPath,
      mockAccounts: MOCK_ACCOUNTS 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
