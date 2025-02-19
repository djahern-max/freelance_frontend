// components/payments/DonationSuccess.js
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import styles from './DonationSuccess.module.css';

const DonationSuccess = () => {
    const navigate = useNavigate();
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const [error, setError] = useState(null);

    useEffect(() => {
        const verifyDonation = async () => {
            try {
                // Short delay to allow webhook processing
                await new Promise(resolve => setTimeout(resolve, 2000));

                setVerificationStatus('success');
                const timeout = setTimeout(() => {
                    navigate('/');
                }, 5000);

                return () => clearTimeout(timeout);
            } catch (err) {
                console.error('Donation verification error:', err);
                setVerificationStatus('failed');
                setError('Failed to verify donation. Please contact support if you believe this is an error.');
            }
        };

        verifyDonation();
    }, [navigate]);

    if (verificationStatus === 'verifying') {
        return (
            <div className="loading-spinner">Loading...</div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {verificationStatus === 'success' && (
                    <>
                        <div className={styles.icon}>❤️</div>
                        <h1 className={styles.title}>Thank You for Your Support!</h1>
                        <p className={styles.message}>
                            Your donation helps us continue to improve RYZE.ai and support our community.
                        </p>
                        <p className={styles.redirect}>Redirecting to home page in a few seconds...</p>
                        <button
                            className={styles.button}
                            onClick={() => navigate('/')}
                        >
                            Return to Home
                        </button>
                    </>
                )}

                {verificationStatus === 'failed' && (
                    <>
                        <div className={styles.errorIcon}>×</div>
                        <h1 className={styles.title}>Verification Issue</h1>
                        <p className={styles.error}>{error}</p>
                        <button
                            className={styles.button}
                            onClick={() => navigate('/')}
                        >
                            Return to Home
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default DonationSuccess;