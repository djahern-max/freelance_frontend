// src/components/auth/OAuthSuccess.js
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../utils/api';
import { login } from '../../redux/authSlice';

// Inline styles for immediate use without requiring a separate CSS file
const styles = {
    oauthSuccessPage: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '20px'
    },
    oauthSuccessCard: {
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '32px 40px',
        textAlign: 'center',
        width: '100%',
        maxWidth: '450px'
    },
    spinnerContainer: {
        display: 'flex',
        justifyContent: 'center',
        margin: '10px 0'
    },
    spinner: {
        width: '50px',
        height: '50px',
        border: '4px solid rgba(0, 123, 255, 0.1)',
        borderRadius: '50%',
        borderTopColor: '#007bff',
        animation: 'spin 1s linear infinite'
    },
    statusIcon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '0 auto',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        fontSize: '28px',
        fontWeight: 'bold'
    },
    successIcon: {
        backgroundColor: '#28a745',
        color: 'white'
    },
    errorIcon: {
        backgroundColor: '#dc3545',
        color: 'white'
    },
    statusTitle: {
        fontSize: '24px',
        margin: '16px 0 8px',
        color: '#333',
        fontWeight: '600'
    },
    redirectMessage: {
        color: '#6c757d',
        marginBottom: '8px',
        fontSize: '16px'
    }
};

const OAuthSuccess = () => {
    const [status, setStatus] = useState('Authentication successful! Redirecting to your dashboard...');
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
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
                    setStatus('Missing authentication token');
                    setIsError(true);
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

                    // Success state
                    setIsLoading(false);

                    // Determine redirect based on user type
                    let redirectPath = '/dashboard'; // Default fallback
                    let statusMessage = 'Login successful!';

                    if (userData.needs_role_selection) {
                        redirectPath = '/select-role';
                        statusMessage = 'Welcome! Please select your role to continue';
                    } else if (userData.user_type === 'client') {
                        redirectPath = '/client-dashboard';
                        statusMessage = `Welcome back, ${userData.username || 'Client'}!`;
                    } else if (userData.user_type === 'developer') {
                        redirectPath = '/developer-dashboard';
                        statusMessage = `Welcome back, ${userData.username || 'Developer'}!`;
                    }

                    setStatus(statusMessage);

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

                        setIsLoading(false);

                        // Determine redirect based on stored user type
                        let redirectPath = '/dashboard';
                        let statusMessage = 'Login successful!';

                        if (storedUser.userType === 'client') {
                            redirectPath = '/client-dashboard';
                            statusMessage = `Welcome back, ${storedUser.username || 'Client'}!`;
                        } else if (storedUser.userType === 'developer') {
                            redirectPath = '/developer-dashboard';
                            statusMessage = `Welcome back, ${storedUser.username || 'Developer'}!`;
                        }

                        setStatus(statusMessage);
                        setTimeout(() => navigate(redirectPath), 1500);
                    } else {
                        setIsLoading(false);
                        setStatus('Could not retrieve your profile');
                        setIsError(true);
                        setTimeout(() => navigate('/select-role'), 1500);
                    }
                }
            } catch (error) {
                console.error('OAuth success error:', error);
                setStatus('Authentication error');
                setIsLoading(false);
                setIsError(true);
                localStorage.removeItem('token');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        completeAuth();
    }, [dispatch, location.search, navigate]);

    // Add a style for the spinner animation
    useEffect(() => {
        // Create a style element for the animation
        const styleEl = document.createElement('style');

        // Define the animation
        styleEl.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;

        // Add it to the document head
        document.head.appendChild(styleEl);

        // Cleanup when component unmounts
        return () => {
            document.head.removeChild(styleEl);
        };
    }, []);

    return (
        <div style={styles.oauthSuccessPage}>
            <div style={styles.oauthSuccessCard}>
                {isLoading ? (
                    <div style={styles.spinnerContainer}>
                        <div style={styles.spinner}></div>
                    </div>
                ) : (
                    <div style={{
                        ...styles.statusIcon,
                        ...(isError ? styles.errorIcon : styles.successIcon)
                    }}>
                        {isError ? '✕' : '✓'}
                    </div>
                )}
                <h2 style={styles.statusTitle}>{status}</h2>
                <p style={styles.redirectMessage}>
                    {isError ? 'Redirecting to login...' : 'You will be redirected automatically'}
                </p>
            </div>
        </div>
    );
};

export default OAuthSuccess;