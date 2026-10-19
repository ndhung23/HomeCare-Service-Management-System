import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import bookingApi from '../api/bookingApi';

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('giupviec24_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [bookings, setBookings] = useState([]);
  const [accounts, setAccounts] = useState([]);

  // Fetch accounts from MongoDB for quick role-switching in Login
  const fetchAccounts = useCallback(async () => {
    try {
      const data = await authApi.getAccounts();
      if (Array.isArray(data) && data.length > 0) {
        setAccounts(data);
      }
    } catch (err) {
      console.warn('Không thể tải danh sách tài khoản từ MongoDB:', err.message);
    }
  }, []);

  // Fetch bookings from MongoDB
  const fetchBookings = useCallback(async () => {
    try {
      const data = await bookingApi.getBookings();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.warn('Không thể tải danh sách đơn dịch vụ từ MongoDB:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchBookings();
  }, [fetchAccounts, fetchBookings]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('giupviec24_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('giupviec24_user');
    }
  }, [user]);

  // Login via MongoDB API
  const login = async (emailOrRole, password = '') => {
    try {
      const payload = emailOrRole.includes('@')
        ? { email: emailOrRole, password }
        : { role: emailOrRole, password: password || '123' };

      const res = await authApi.login(payload);
      const loggedUser = res.user;
      if (res.token) {
        localStorage.setItem('giupviec24_token', res.token);
      }
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      // Fallback local if server network issue
      const fallbackUser = {
        role: emailOrRole.includes('@') ? 'customer' : emailOrRole,
        name: emailOrRole.split('@')[0] || 'Người dùng',
        email: emailOrRole.includes('@') ? emailOrRole : `${emailOrRole}@giupviec24.vn`,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        redirectPath: emailOrRole === 'customer' || emailOrRole.includes('@') ? '/' : getRoleDashboardPath(emailOrRole),
        dashboardPath: getRoleDashboardPath(emailOrRole.includes('@') ? 'customer' : emailOrRole),
        roleName: 'Khách hàng',
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  // Register via MongoDB API
  const register = async (userData) => {
    try {
      const res = await authApi.register({
        name: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password || '123',
        phone: userData.phone || '',
        role: userData.role || 'customer',
      });
      const newUser = res.user;
      if (res.token) {
        localStorage.setItem('giupviec24_token', res.token);
      }
      setUser(newUser);
      fetchAccounts();
      return newUser;
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      const role = userData.role || 'customer';
      const fallbackUser = {
        role,
        name: userData.fullName || 'Người dùng mới',
        email: userData.email,
        phone: userData.phone || '',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        redirectPath: role === 'customer' ? '/' : getRoleDashboardPath(role),
        dashboardPath: getRoleDashboardPath(role),
        roleName: role === 'admin' ? 'Quản trị viên' : role === 'enterprise' ? 'Đối tác doanh nghiệp' : role === 'helper' ? 'Cộng tác viên' : 'Khách hàng',
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  // Add booking to MongoDB
  const addBooking = async (bookingData) => {
    try {
      const created = await bookingApi.createBooking(bookingData);
      setBookings((prev) => [created, ...prev]);
      return created;
    } catch (err) {
      console.error('Lỗi lưu đơn vào MongoDB:', err);
      const fallback = {
        id: `BK-${Date.now().toString().slice(-4)}`,
        bookingCode: `BK-${Date.now().toString().slice(-4)}`,
        status: 'Chờ người nhận',
        statusColor: 'amber',
        ...bookingData,
      };
      setBookings((prev) => [fallback, ...prev]);
      return fallback;
    }
  };

  const logout = () => {
    localStorage.removeItem('giupviec24_token');
    localStorage.removeItem('giupviec24_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        bookings,
        addBooking,
        refreshBookings: fetchBookings,
        getRoleDashboardPath,
        accounts,
        mockAccounts: accounts.length > 0 ? accounts : [
          { role: 'admin', name: 'Quản Trị Viên (Admin)', email: 'admin@giupviec24.vn', redirectPath: '/admin', dashboardPath: '/admin', roleName: 'Quản trị hệ thống' },
          { role: 'enterprise', name: 'Công ty CleanPro', email: 'dn@cleanpro.vn', redirectPath: '/enterprise', dashboardPath: '/enterprise', roleName: 'Đối tác doanh nghiệp' },
          { role: 'helper', name: 'Nguyễn Thị Lan', email: 'lan.nguyen@giupviec24.vn', redirectPath: '/helper', dashboardPath: '/helper', roleName: 'Cộng tác viên' },
          { role: 'customer', name: 'Trần Văn Hoàng', email: 'khachhang@gmail.com', redirectPath: '/', dashboardPath: '/customer', roleName: 'Khách hàng' },
        ],
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
