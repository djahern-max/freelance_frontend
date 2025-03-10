import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './OAuthCallback.module.css';

/**
 * This component handles the redirect from OAuth providers.
 * It extracts the token from URL parameters and redirects appropriately.
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Parse the query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');
        const provider = location.pathname.split('/').pop(); // Extract provider from URL

        if (error) {
            // Redirect to error page with the error message
            navigate(`/oauth-error?error=${encodeURIComponent(error)}&provider=${provider}`);
            return;
        }

        if (token) {
            // Redirect to success page with the token
            navigate(`/oauth-success?token=${token}&provider=${provider}`);
        } else {
            // If neither token nor error is present, something went wrong
            navigate('/oauth-error?error=Authentication%20failed&provider=unknown');
        }
    }, [location, navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.loader}></div>
            <h2 className={styles.title}>Processing Authentication...</h2>
            <p className={styles.message}>Please wait while we complete your sign-in.</p>
        </div>
    );
};

export default OAuthCallback; 