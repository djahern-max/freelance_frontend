import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './OAuthError.module.css';

const OAuthError = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [errorDetails, setErrorDetails] = useState({
        message: 'Authentication failed',
        provider: 'OAuth'
    });

    useEffect(() => {
        // Parse query parameters
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        const provider = params.get('provider');

        if (error) {
            setErrorDetails({
                message: decodeURIComponent(error),
                provider: provider || 'OAuth'
            });
        }

        // Auto redirect after 10 seconds
        const redirectTimer = setTimeout(() => {
            navigate('/login');
        }, 10000);

        return () => clearTimeout(redirectTimer);
    }, [location, navigate]);

    const getProviderName = (provider) => {
        switch (provider?.toLowerCase()) {
            case 'google':
                return 'Google';
            case 'github':
                return 'GitHub';
            case 'linkedin':
                return 'LinkedIn';
            default:
                return 'OAuth';
        }
    };

    const getErrorMessage = (message) => {
        // Common error handling
        if (message.includes('access_denied')) {
            return 'You declined the authorization request.';
        }

        if (message.includes('unauthorized_scope')) {
            return 'The requested permissions are not available.';
        }

        if (message.includes('Invalid state')) {
            return 'Security validation failed. Please try again.';
        }

        return message;
    };

    return (
        <div className={styles.container}>
            <div className={styles.errorIcon}>❌</div>
            <h2 className={styles.title}>{getProviderName(errorDetails.provider)} Authentication Failed</h2>
            <p className={styles.message}>{getErrorMessage(errorDetails.message)}</p>
            <div className={styles.actions}>
                <Link to="/login" className={styles.returnButton}>
                    Return to Login
                </Link>
            </div>
            <p className={styles.redirectMessage}>You'll be automatically redirected to the login page in a few seconds...</p>
        </div>
    );
};

export default OAuthError;