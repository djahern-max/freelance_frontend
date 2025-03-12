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

                // Store token in localStorage and API
                api.setToken(token);

                try {
                    // Use your existing profile fetch method
                    const userData = await api.profile.fetchUserProfile();

                    // Update Redux store with user data
                    dispatch(login({
                        token,
                        user: {
                            id: userData.id,
                            username: userData.username,
                            email: userData.email,
                            fullName: userData.full_name || '',
                            isActive: userData.is_active,
                            userType: userData.user_type,
                            createdAt: userData.created_at,
                            needsRoleSelection: userData.needs_role_selection || false,
                        },
                    }));

                    // Determine redirect based on user type
                    let redirectPath = '/dashboard'; // Default fallback

                    if (userData.needs_role_selection) {
                        redirectPath = '/select-role';
                        setStatus('Please select a role to continue...');
                    } else if (userData.user_type === 'client') {
                        redirectPath = '/client-dashboard';
                        setStatus('Login successful! Redirecting to Client Dashboard...');
                    } else if (userData.user_type === 'developer') {
                        redirectPath = '/developer-dashboard';
                        setStatus('Login successful! Redirecting to Developer Dashboard...');
                    }

                    // Redirect after a short delay
                    setTimeout(() => navigate(redirectPath), 1500);
                } catch (error) {
                    console.error('Error fetching user profile:', error);

                    // Try fallback to directly getting the stored user from previous logins
                    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

                    if (storedUser) {
                        dispatch(login({
                            token,
                            user: storedUser
                        }));

                        // Determine redirect based on stored user type
                        let redirectPath = '/dashboard';
                        if (storedUser.userType === 'client') {
                            redirectPath = '/client-dashboard';
                            setStatus('Login successful! Redirecting to Client Dashboard...');
                        } else if (storedUser.userType === 'developer') {
                            redirectPath = '/developer-dashboard';
                            setStatus('Login successful! Redirecting to Developer Dashboard...');
                        }

                        setTimeout(() => navigate(redirectPath), 1500);
                    } else {
                        setStatus('Could not retrieve user profile. Redirecting to role selection...');
                        setTimeout(() => navigate('/select-role'), 1500);
                    }
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