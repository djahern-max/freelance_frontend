// components/marketplace/product/ProductCheckout.js
import React, { useState } from 'react';
import styles from './ProductCheckout.module.css';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const ProductCheckout = ({ product, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/payments/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                })
            });

            const { url } = await response.json();

            // Redirect to Stripe's hosted checkout page
            window.location.href = url;
        } catch (err) {
            setError('Failed to initiate checkout. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.checkoutContainer}>
            <div className={styles.priceDisplay}>
                ${product.price.toFixed(2)}
            </div>

            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            <button
                onClick={handleCheckout}
                disabled={loading}
                className={styles.checkoutButton}
            >
                {loading ? 'Processing...' : 'Purchase Now'}
            </button>
        </div>
    );
};

export default ProductCheckout;