// src/components/common/ProtectedRoute.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ userType, children }) => {
  const auth = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.token) {
      navigate('/login');
      return;
    }

    // Only redirect for dashboard-specific routes
    if (
      userType &&
      (userType === 'client' || userType === 'developer') &&
      auth.user?.userType !== userType
    ) {
      navigate(
        auth.user?.userType === 'client'
          ? '/client-dashboard'
          : '/developer-dashboard'
      );
    }
  }, [auth, userType, navigate]);

  return auth.token ? children : null;
};

export default ProtectedRoute;
