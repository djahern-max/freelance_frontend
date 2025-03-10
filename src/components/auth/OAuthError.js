// src/components/auth/OAuthError.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './OAuthError.module.css';

const OAuthError = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    // Get error details from URL
    const errorMessage = params.get('error') || 'Authentication failed';
    const provider = params.get('provider') || 'OAuth provider';

    // Format provider name for display
    const formatProviderName = (name) => {
        if (!name) return 'OAuth Provider';
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    const providerName = formatProviderName(provider);

    return (
        <div className={styles.container}>
            <div className={styles.errorCard}>
                <div className={styles.errorIcon}></div>

                <h2 className={styles.title}>Authentication Failed</h2>

                <p className={styles.message}>
                    We couldn't authenticate you with {providerName}.
                </p>

                <div className={styles.errorDetails}>
                    <p>{errorMessage}</p>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.primaryButton}
                        onClick={() => navigate('/login')}
                    >
                        Return to Login
                    </button>

                    <button
                        className={styles.secondaryButton}
                        onClick={() => navigate('/')}
                    >
                        Go to Homepage
                    </button>
                </div>

                <div className={styles.helpText}>
                    <p>If this problem persists, please contact support.</p>
                </div>
            </div>
        </div>
    );
};

export default OAuthError;