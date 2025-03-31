import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';
import styles from './OAuthCallback.module.css'; // Import the CSS module

const OAuthCallback = () => {
    const [status, setStatus] = useState('Processing your login...');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Parse the query parameters - most importantly, token
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const error = params.get('error');

                if (error) {
                    throw new Error(`OAuth error: ${error}`);
                }

                if (!token) {
                    throw new Error('No authentication token received');
                }

                // Store the token
                localStorage.setItem('token', token);

                // Use the token to fetch user data
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await api.get('/auth/me');

                if (response.data) {
                    const user = response.data;

                    // Update Redux store
                    dispatch(login({
                        user: {
                            id: user.id,
                            username: user.username,
                            email: user.email,
                            fullName: user.full_name,
                            isActive: user.is_active,
                            userType: user.user_type,
                            createdAt: user.created_at,
                        },
                        token
                    }));

                    // Check if user needs to select a role
                    if (user.needs_role_selection) {
                        setStatus('Redirecting to role selection...');
                        navigate('/select-role');
                    } else {
                        // User already has a role, redirect to appropriate dashboard
                        const dashboardPath = user.user_type === 'client'
                            ? '/client-dashboard'
                            : '/developer-dashboard';

                        // Apply styling to this message
                        setStatus(`Login successful. Redirecting to ${user.user_type} dashboard...`);
                        setTimeout(() => {
                            navigate(dashboardPath);
                        }, 1500); // Short delay to show the success message
                    }
                } else {
                    throw new Error('User data not received from server');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('Authentication failed. Redirecting to login page...');
                setIsError(true);

                // Clear token
                localStorage.removeItem('token');

                // Redirect to login with error message
                setTimeout(() => {
                    navigate('/login?error=authentication_failed');
                }, 2000);
            }
        };

        handleOAuthCallback();
    }, [location, navigate, dispatch]);

    return (
        <div className={styles.container}>
            {isError ? (
                <div className={styles.errorIcon}></div>
            ) : (
                <div className={styles.loader}></div>
            )}
            <h2 className={styles.title}>Authentication</h2>
            <p className={styles.message}>{status}</p>
        </div>
    );
};

export default OAuthCallback;