import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';
import axios from 'axios';
import styles from './SelectRole.module.css';


const SelectRole = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    // Parse query parameters
    const searchParams = new URLSearchParams(location.search);
    const isOAuth = searchParams.get('oauth') === 'true';
    const tempToken = searchParams.get('temp_token');

    // API URL handling
    const apiBaseUrl = process.env.REACT_APP_API_URL || '';
    const isProduction = !apiBaseUrl.includes('://');

    // For debugging - log important values on component mount
    useEffect(() => {
        console.log('SelectRole Component Mounted');
        console.log('isOAuth:', isOAuth);
        console.log('tempToken:', tempToken);
        console.log('API Base URL:', apiBaseUrl);
        console.log('Is Production:', isProduction);

        // Store debug info for potential display to the user
        setDebugInfo({
            isOAuth,
            hasToken: !!tempToken,
            apiBaseUrl,
            isProduction
        });
    }, [isOAuth, tempToken, apiBaseUrl, isProduction]);
    // In SelectRole.js
    const handleRoleSelection = async (role) => {
        setIsLoading(true);
        setError('');

        try {
            // If coming from OAuth flow with a temp token
            if (isOAuth && tempToken) {
                console.log('Processing OAuth registration with role:', role);

                // Build the URL properly
                const apiUrl = process.env.REACT_APP_API_URL || '';
                const completeRegistrationUrl = apiUrl + '/complete-oauth-registration';

                // Make the API call with axios
                const response = await axios.post(
                    completeRegistrationUrl,
                    {
                        temp_token: tempToken,
                        user_type: role
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Extract response data
                const { access_token, token_type, user_type } = response.data;

                if (!access_token) {
                    throw new Error('No access token received');
                }

                // Store token and update auth state
                localStorage.setItem('token', access_token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

                // Get user details 
                const userResponse = await axios.get(
                    apiUrl + '/auth/me',
                    {
                        headers: {
                            'Authorization': `Bearer ${access_token}`
                        }
                    }
                );

                // Update Redux state
                dispatch(
                    login({
                        token: access_token,
                        user: {
                            ...userResponse.data,
                            userType: user_type
                        }
                    })
                );

                // Redirect to appropriate dashboard
                const dashboardPath = user_type === 'client'
                    ? '/client-dashboard'
                    : '/developer-dashboard';

                navigate(dashboardPath);
            } else {
                // For regular registration, redirect to registration page
                navigate(`/register?role=${role}`);
            }
        } catch (err) {
            console.error('Error during role selection:', err);
            setError(`Error: ${err.response?.data?.detail || err.message}. Please try again.`);
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.roleSelectionPage}>
            <div className={styles.roleSelectionContainer}>
                <h2 className={styles.roleSelectionTitle}>What brings you to RYZE.ai?</h2>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.roleButtons}>
                    <button
                        onClick={() => handleRoleSelection('client')}
                        disabled={isLoading}
                        className={`${styles.roleButton} ${styles.clientButton}`}
                    >
                        <div className={styles.roleButtonContent}>
                            <span className={styles.roleIcon}>💼</span>
                            <h3>Client</h3>
                            <p>I need software solutions</p>
                        </div>
                    </button>

                    <button
                        onClick={() => handleRoleSelection('developer')}
                        disabled={isLoading}
                        className={`${styles.roleButton} ${styles.developerButton}`}
                    >
                        <div className={styles.roleButtonContent}>
                            <span className={styles.roleIcon}>💻</span>
                            <h3>Developer</h3>
                            <p>I provide development services</p>
                        </div>
                    </button>
                </div>

                {isLoading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Processing your selection...</p>
                    </div>
                )}

                {/* Add debug information in development environments */}
                {process.env.NODE_ENV === 'development' && (
                    <details className={styles.debugInfo}>
                        <summary>Debug Information</summary>
                        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                    </details>
                )}
            </div>
        </div>
    );
};

export default SelectRole;