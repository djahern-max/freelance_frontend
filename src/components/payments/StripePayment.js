import React, { useState } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import styles from './StripePayment.module.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Separate checkout form component that uses the hooks
const CheckoutForm = ({ amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/payments/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Payment failed');
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                data.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: 'Customer Name',
                        },
                    },
                }
            );

            if (stripeError) {
                throw new Error(stripeError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                onSuccess?.();
            }
        } catch (err) {
            setError(err.message);
            onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={styles.paymentForm}>
            <div className={styles.cardElementContainer}>
                <CardElement
                    options={{
                        style: {
                            base: {
                                fontSize: '16px',
                                color: '#424770',
                                '::placeholder': {
                                    color: '#aab7c4',
                                },
                            },
                            invalid: {
                                color: '#9e2146',
                            },
                        },
                    }}
                />
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !stripe}
                className={`${styles.submitButton} ${loading ? styles.loading : ''}`}
            >
                {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
            </button>
        </form>
    );
};

// Main component that wraps the checkout form with Elements provider
const StripePayment = (props) => {
    return (
        <div className={styles.paymentContainer}>
            <div className={styles.paymentCard}>
                <h2 className={styles.cardTitle}>Payment Details</h2>
                <Elements stripe={stripePromise}>
                    <CheckoutForm {...props} />
                </Elements>
            </div>
        </div>
    );
};

export default StripePayment;