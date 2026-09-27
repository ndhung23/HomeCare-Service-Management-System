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
import AdminDashboard from './pages/admin/AdminDashboard';
import EnterpriseDashboard from './pages/enterprise/EnterpriseDashboard';
import HelperProfile from './pages/helper/HelperProfile';
import CustomerProfile from './pages/customer/CustomerProfile';
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
          <Route path="/helpers" element={<HelpersPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reviews" element={<ReviewsPage />} />
          <Route path="/news" element={<NewsPage />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Role specific routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          <Route path="/helper" element={<HelperProfile />} />
          <Route path="/customer" element={<CustomerProfile />} />
          
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