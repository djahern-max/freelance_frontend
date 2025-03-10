import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';

const OAuthCallback = () => {
    const [status, setStatus] = useState('Processing your login...');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleOAuthCallback = async () => {
            try {
                // Parse the query parameters
                const params = new URLSearchParams(location.search);
                const provider = params.get('provider'); // 'google', 'github', or 'linkedin'
                const code = params.get('code');
                const error = params.get('error');

                if (error) {
                    throw new Error(`OAuth error: ${error}`);
                }

                if (!provider || !code) {
                    throw new Error('Missing required OAuth parameters');
                }

                // Exchange the authorization code for user data
                const response = await api.post(`/auth/${provider}/callback`, { code });

                // Handle successful authentication
                if (response.data) {
                    const { user, provider_id } = response.data;

                    // Store provider ID in localStorage
                    if (provider === 'google') {
                        localStorage.setItem('google_id', provider_id);
                    } else if (provider === 'github') {
                        localStorage.setItem('github_id', provider_id);
                    } else if (provider === 'linkedin') {
                        localStorage.setItem('linkedin_id', provider_id);
                    }

                    if (user) {
                        // User exists, update Redux store
                        dispatch(login({
                            user: {
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                fullName: user.full_name,
                                isActive: user.is_active,
                                userType: user.user_type,
                                createdAt: user.created_at,
                            }
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

                            setStatus(`Login successful. Redirecting to ${user.user_type} dashboard...`);
                            navigate(dashboardPath);
                        }
                    } else {
                        // This shouldn't typically happen if the backend is set up correctly
                        throw new Error('User data not received from server');
                    }
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setStatus('Authentication failed. Redirecting to login page...');

                // Clear any OAuth related storage
                localStorage.removeItem('google_id');
                localStorage.removeItem('github_id');
                localStorage.removeItem('linkedin_id');

                // Redirect to login with error message
                setTimeout(() => {
                    navigate('/login?error=authentication_failed');
                }, 2000);
            }
        };

        handleOAuthCallback();
    }, [location, navigate, dispatch]);

    return (
        <div className="oauth-callback-container">
            <div className="oauth-callback-content">
                <div className="loading-spinner"></div>
                <h2>{status}</h2>
            </div>
        </div>
    );
};

export default OAuthCallback;