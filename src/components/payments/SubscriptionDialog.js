import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import api, { API_ROUTES } from '../../utils/api';
import styles from './SubscriptionDialog.module.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const SubscriptionDialog = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.post(API_ROUTES.PAYMENTS.CREATE_SUBSCRIPTION);
      if (response?.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message || 'Failed to start subscription');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h2 className={styles.title}>Creator Subscription Required</h2>
        <p className={styles.description}>
          To communicate with clients and access opportunities, a subscription
          is required. The monthly fee is $20.
        </p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.subscribeButton}
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionDialog;
