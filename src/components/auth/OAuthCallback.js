// src/components/auth/OAuthCallback.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../../redux/authSlice';
import api from '../../utils/api';

const OAuthCallback = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const processGoogleLogin = async () => {
            const params = new URLSearchParams(location.search);
            const token = params.get('token');

            if (!token) {
                console.error('No token received from Google');
                navigate('/login', {
                    state: { error: 'Google authentication failed. Please try again.' }
                });
                return;
            }

            try {
                // Store token and update API headers
                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Get user data
                const userResponse = await api.get('/auth/me');
                const userData = userResponse.data;

                if (!userData || !userData.user_type) {
                    throw new Error('Invalid user data received');
                }

                // Normalize the user data
                const normalizedUser = {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    fullName: userData.full_name,
                    isActive: userData.is_active,
                    userType: userData.user_type,
                    createdAt: userData.created_at,
                };

                // Update auth state
                dispatch(
                    login({
                        token,
                        user: normalizedUser,
                    })
                );

                // Determine redirect based on user type
                let redirectPath;
                if (normalizedUser.userType === 'client') {
                    redirectPath = '/client-dashboard';
                } else if (normalizedUser.userType === 'developer') {
                    redirectPath = '/developer-dashboard';
                } else {
                    redirectPath = '/';
                }

                navigate(redirectPath, { replace: true });
            } catch (error) {
                console.error('Google login error:', error);
                navigate('/login', {
                    state: { error: 'Failed to complete Google authentication. Please try again.' }
                });
            }
        };

        processGoogleLogin();
    }, [dispatch, location.search, navigate]);

    return (
        <div className="oauth-loading" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column'
        }}>
            <div style={{ marginBottom: '20px' }}>Processing Google login...</div>
            {/* Simple loading spinner */}
            <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                animation: 'spin 2s linear infinite'
            }}></div>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export default OAuthCallback;