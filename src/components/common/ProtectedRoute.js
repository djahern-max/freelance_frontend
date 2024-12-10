// src/components/common/ProtectedRoute.js

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ userType, children }) => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!auth.token) {
      // Save the attempted URL
      navigate('/login', {
        state: { from: location.pathname },
      });
      return;
    }

    // For dashboard routes, ensure user is redirected to their correct dashboard
    if (userType && auth.user?.userType !== userType) {
      const correctDashboard =
        auth.user?.userType === 'client'
          ? '/client-dashboard'
          : '/developer-dashboard';
      navigate(correctDashboard, { replace: true });
    }
  }, [auth, userType, navigate, location]);

  return auth.token ? children : null;
};

export default ProtectedRoute;
