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

  // Verify JWT session on app start
  useEffect(() => {
    const token = localStorage.getItem('giupviec24_token');
    if (token) {
      authApi
        .getMe()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem('giupviec24_user', JSON.stringify(res.user));
          }
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            console.warn('JWT token hết hạn hoặc không hợp lệ');
            localStorage.removeItem('giupviec24_token');
            localStorage.removeItem('giupviec24_user');
            setUser(null);
          }
        });
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

  // Login via MongoDB API with JWT
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
      throw err;
    }
  };

  // Register via MongoDB API with JWT
  const register = async (userData) => {
    try {
      const res = await authApi.register({
        name: userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
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
      throw err;
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
