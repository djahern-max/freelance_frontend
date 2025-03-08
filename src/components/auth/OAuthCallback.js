import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import styles from './OAuthCallback.module.css';

const OAuthCallback = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [debugInfo, setDebugInfo] = useState({});
    const navigate = useNavigate();
    const location = useLocation();


    useEffect(() => {
        const processOAuthCallback = async () => {
            try {
                // Extract URL parameters
                const searchParams = new URLSearchParams(location.search);
                const code = searchParams.get('code');
                const state = searchParams.get('state');

                // Determine the provider from the URL path
                const pathParts = location.pathname.split('/');
                const providerIndex = pathParts.findIndex(part => part === 'callback');
                const provider = (providerIndex >= 0 && pathParts.length > providerIndex + 1)
                    ? pathParts[providerIndex + 1]
                    : null;

                // After successful OAuth callback, redirect to role selection
                // with temporary token in query parameters
                if (code && state && provider) {
                    // The backend should handle the OAuth exchange and include 
                    // a temp_token in its response
                    const backendResponse = await new Promise(resolve => {
                        // We're not doing anything here - the backend handles the redirect
                        // This is just to handle timeout if backend doesn't redirect
                        setTimeout(() => {
                            resolve({ success: false });
                        }, 10000);
                    });

                    // If no redirect happens, show an error
                    setError('No response from server. Please try again.');
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('OAuth callback error:', err);
                setError(err.message || 'Authentication failed. Please try again.');
                setIsLoading(false);
            }
        };

        processOAuthCallback();
    }, [location, navigate]);

    const handleRetry = () => {
        navigate('/login');
    };

    return (
        <div className={styles.callbackContainer}>
            {isLoading ? (
                <div className={styles.loadingSection}>
                    <div className={styles.spinner}></div>
                    <h2>Processing your authentication...</h2>
                    <p>Please wait while we complete your sign-in.</p>
                </div>
            ) : (
                <div className={styles.errorSection}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2>Authentication Error</h2>
                    <p>{error}</p>
                    <button onClick={handleRetry} className={styles.retryButton}>
                        Return to Login
                    </button>

                    {process.env.NODE_ENV === 'development' && (
                        <div className={styles.debugSection}>
                            <h3>Debug Information</h3>
                            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OAuthCallback;