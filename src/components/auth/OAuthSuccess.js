import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../utils/api';
import { login } from '../../redux/authSlice';

const OAuthSuccess = () => {
    const [status, setStatus] = useState('Authentication successful! Redirecting to your dashboard...');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const completeAuth = async () => {
            try {
                // Get token from query params
                const params = new URLSearchParams(location.search);
                const token = params.get('token');

                if (!token) {
                    setStatus('Missing authentication token. Redirecting to login...');
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                // Store token in localStorage
                localStorage.setItem('token', token);

                // Fetch user data to determine where to redirect
                const response = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data) {
                    // Update Redux store with user data
                    dispatch(login({
                        token,
                        user: {
                            id: response.data.id,
                            username: response.data.username,
                            email: response.data.email,
                            fullName: response.data.full_name || '',
                            isActive: response.data.is_active,
                            userType: response.data.user_type,
                            createdAt: response.data.created_at,
                        },
                    }));

                    // Determine redirect based on user type
                    let redirectPath = '/dashboard'; // Default fallback

                    if (response.data.user_type === 'client') {
                        redirectPath = '/client-dashboard';
                        setStatus('Login successful! Redirecting to Client Dashboard...');
                    } else if (response.data.user_type === 'developer') {
                        redirectPath = '/developer-dashboard';
                        setStatus('Login successful! Redirecting to Developer Dashboard...');
                    } else if (!response.data.user_type) {
                        // This shouldn't happen as users should have selected a role,
                        // but just in case, redirect to role selection
                        redirectPath = '/select-role';
                        setStatus('Please select a role to continue...');
                    }

                    // Redirect after a short delay
                    setTimeout(() => navigate(redirectPath), 1500);
                } else {
                    throw new Error('Failed to retrieve user data');
                }
            } catch (error) {
                console.error('OAuth success error:', error);
                setStatus('Authentication error. Redirecting to login...');
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        completeAuth();
    }, [dispatch, location.search, navigate]);

    return (
        <div className="oauth-success-container">
            <div className="success-content">
                <div className="success-icon">✅</div>
                <h2>{status}</h2>
            </div>
        </div>
    );
};

export default OAuthSuccess;