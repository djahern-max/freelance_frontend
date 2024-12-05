import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SubscriptionSuccess.module.css';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // After 5 seconds, redirect to opportunities page
    const timeout = setTimeout(() => {
      navigate('/opportunities');
    }, 5000);

    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>✓</div>
        <h1 className={styles.title}>Subscription Activated!</h1>
        <p className={styles.message}>
          Thank you for subscribing. You now have full access to communicate
          with clients and respond to opportunities.
        </p>
        <p className={styles.redirect}>
          You'll be redirected to opportunities in a few seconds...
        </p>
        <button
          className={styles.button}
          onClick={() => navigate('/opportunities')}
        >
          View Opportunities Now
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
