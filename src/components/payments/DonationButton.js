import React, { useState } from 'react';
import styles from './DonationButton.module.css';
import { stripeService } from '../../utils/stripeService';

const DonationButton = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleDonation = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await stripeService.createDonationSession({
                amount: 500, // $5.00 by default
                currency: 'usd'
            });

            // Redirect to Stripe Checkout
            window.location.href = response.url;
        } catch (err) {
            setError('Failed to process donation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <button
                onClick={handleDonation}
                disabled={loading}
                className={styles.donateButton}
            >
                <span className={styles.icon}>♥</span>
                {loading ? 'Processing...' : 'Support RYZE'}
            </button>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}
        </div>
    );
};

export default DonationButton;