import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import styles from './SubscriptionSuccess.module.css';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying');
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifySubscriptionAndCreateConversation = async () => {
      try {
        // Get the pending request ID if it exists
        const pendingRequestId = localStorage.getItem(
          'pending_conversation_request_id'
        );

        // Verify subscription
        const response = await api.get('/payments/subscription-status');

        if (response.data.status === 'active') {
          // If there's a pending conversation request, create it
          if (pendingRequestId) {
            try {
              const convResponse = await api.post(
                api.API_ROUTES.CONVERSATIONS.CREATE,
                {
                  request_id: pendingRequestId,
                }
              );

              // Clear the stored request ID
              localStorage.removeItem('pending_conversation_request_id');

              if (convResponse.data && convResponse.data.id) {
                setVerificationStatus('success');
                // Redirect to the new conversation
                const timeout = setTimeout(() => {
                  navigate(`/conversations/${convResponse.data.id}`);
                }, 3000);
                return () => clearTimeout(timeout);
              }
            } catch (convErr) {
              console.error('Error creating conversation:', convErr);
              // If conversation creation fails, still mark subscription as success
              // but show a specific error message
              setVerificationStatus('success');
              setError(
                'Subscription activated, but conversation creation failed. Please try again from the opportunities page.'
              );
              const timeout = setTimeout(() => {
                navigate('/opportunities');
              }, 3000);
              return () => clearTimeout(timeout);
            }
          } else {
            // No pending conversation, proceed normally
            setVerificationStatus('success');
            const timeout = setTimeout(() => {
              navigate('/opportunities');
            }, 3000);
            return () => clearTimeout(timeout);
          }
        } else {
          setVerificationStatus('failed');
          setError(
            'Subscription activation pending. Please contact support if this persists.'
          );
        }
      } catch (err) {
        setVerificationStatus('failed');
        setError('Failed to verify subscription. Please contact support.');
      }
    };

    // Wait a short moment before verifying to allow webhook processing
    const verificationTimeout = setTimeout(
      verifySubscriptionAndCreateConversation,
      2000
    );
    return () => clearTimeout(verificationTimeout);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {verificationStatus === 'verifying' && (
          <>
            <div className={styles.spinner} />
            <h1 className={styles.title}>Verifying Subscription...</h1>
            <p className={styles.message}>
              Please wait while we confirm your subscription status.
            </p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className={styles.icon}>✓</div>
            <h1 className={styles.title}>Subscription Activated!</h1>
            <p className={styles.message}>
              {error ||
                'Thank you for subscribing. You now have full access to communicate with clients and respond to opportunities.'}
            </p>
            <p className={styles.redirect}>Redirecting in a few seconds...</p>
            <button
              className={styles.button}
              onClick={() => navigate('/opportunities')}
            >
              View Opportunities Now
            </button>
          </>
        )}

        {verificationStatus === 'failed' && (
          <>
            <div className={styles.errorIcon}>×</div>
            <h1 className={styles.title}>Verification Failed</h1>
            <p className={styles.error}>{error}</p>
            <button
              className={styles.button}
              onClick={() => navigate('/opportunities')}
            >
              Continue to Opportunities
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
