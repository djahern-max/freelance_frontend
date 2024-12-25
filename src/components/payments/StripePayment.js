// src/components/payments/StripePayment.js
import React, { useState } from 'react';
import { Elements } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import styles from './StripePayment.module.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StripePayment = ({ amount, onSuccess, onError }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/payments/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Payment failed');
            }

            const stripe = await stripePromise;
            const { error: stripeError } = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: 'Customer Name',
                    },
                },
            });

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            onSuccess?.();
        } catch (err) {
            setError(err.message);
            onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.paymentContainer}>
            <div className={styles.paymentCard}>
                <h2 className={styles.cardTitle}>Payment Details</h2>
                <form onSubmit={handleSubmit} className={styles.paymentForm}>
                    <div className={styles.cardElementContainer}>
                        <Elements stripe={stripePromise}>
                            <div className={styles.cardElement}>
                                {/* Stripe Elements will be inserted here */}
                            </div>
                        </Elements>
                    </div>

                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
                    >
                        {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default StripePayment;