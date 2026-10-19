import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireRole = ({ allowedRoles = [], children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned dashboard
    const destination = user.dashboardPath || (
      user.role === 'admin' ? '/admin' :
      user.role === 'enterprise' ? '/enterprise' :
      user.role === 'helper' ? '/helper' : '/customer'
    );
    return <Navigate to={destination} replace />;
  }

  return children;
};

export default RequireRole;

