import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';
import api from '../../utils/api';
import styles from './OAuthSuccess.module.css';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const processOAuth = async () => {
            try {
                // Parse query parameters
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const provider = params.get('provider');

                if (!token) {
                    throw new Error('No token received');
                }

                // Store token in localStorage
                localStorage.setItem('token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Fetch user data
                const userResponse = await api.get('/auth/me');
                const userData = userResponse.data;

                if (!userData?.user_type) {
                    throw new Error('Invalid user data received');
                }

                // Normalize user data
                const normalizedUser = {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    fullName: userData.full_name,
                    isActive: userData.is_active,
                    userType: userData.user_type,
                    createdAt: userData.created_at,
                };

                // Dispatch login action
                dispatch(login({ token, user: normalizedUser }));

                // Redirect to appropriate dashboard
                const dashboardPath = getDashboardPath(userData.user_type);
                navigate(dashboardPath, { replace: true });
            } catch (error) {
                console.error('OAuth processing error:', error);
                navigate('/login', { state: { error: 'Authentication failed. Please try again.' } });
            }
        };

        processOAuth();
    }, [location, dispatch, navigate]);

    const getDashboardPath = (userType) => {
        switch (userType?.toLowerCase()) {
            case 'client':
                return '/client-dashboard';
            case 'developer':
                return '/developer-dashboard';
            default:
                return '/login';
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loader}></div>
            <h2 className={styles.title}>Logging you in...</h2>
            <p className={styles.message}>Please wait while we complete the authentication process.</p>
        </div>
    );
};

export default OAuthSuccess;