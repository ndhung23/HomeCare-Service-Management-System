import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import ServicesPage from './pages/ServicesPage';
import HelpersPage from './pages/HelpersPage';
import AboutPage from './pages/AboutPage';
import ReviewsPage from './pages/ReviewsPage';
import NewsPage from './pages/NewsPage';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import EnterpriseDashboard from './pages/enterprise/EnterpriseDashboard';
import HelperProfile from './pages/helper/HelperProfile';
import CustomerProfile from './pages/customer/CustomerProfile';
import BookingPage from './pages/BookingPage';
import RequireRole from './components/auth/RequireRole';
import './index.css';

// Dynamic /profile redirector based on logged-in role
const ProfileRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.dashboardPath || '/customer'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Website Navigation Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:id/book" element={<BookingPage />} />
          <Route path="/helpers" element={<HelpersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/news" element={<NewsPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          
          {/* Role specific routes */}
          <Route
            path="/admin"
            element={
              <RequireRole allowedRoles={['admin']}>
                <AdminDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/enterprise"
            element={
              <RequireRole allowedRoles={['enterprise', 'admin']}>
                <EnterpriseDashboard />
              </RequireRole>
            }
          />
          <Route
            path="/helper"
            element={
              <RequireRole allowedRoles={['helper', 'admin']}>
                <HelperProfile />
              </RequireRole>
            }
          />
          <Route
            path="/customer"
            element={
              <RequireRole allowedRoles={['customer', 'admin']}>
                <CustomerProfile />
              </RequireRole>
            }
          />
          
          {/* General profile route redirects to user's role dashboard */}
          <Route path="/profile" element={<ProfileRedirect />} />
          
          {/* Catch-all redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;