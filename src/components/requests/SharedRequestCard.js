// SharedRequestCard.jsx
import { FileText, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SubscriptionDialog from '../payments/SubscriptionDialog';
import styles from './SharedRequestCard.module.css';

const SharedRequestCard = ({ request }) => {
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const checkSubscriptionAndStartConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      const subscriptionResponse = await api.subscriptions.getStatus();

      if (!subscriptionResponse || subscriptionResponse.status !== 'active') {
        setShowSubscriptionDialog(true);
        return;
      }

      const conversationResponse = await api.conversations.create({
        request_id: request.id,
      });

      navigate(`/conversations/${conversationResponse.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      if (err.response?.status === 403) {
        setShowSubscriptionDialog(true);
        return;
      }
      setError(err.message || 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/requests/${request.id}`);
  };

  return (
    <div className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>{request.title}</h3>
        <p className={styles.description}>{request.content}</p>

        <div className={styles.metadata}>
          <span className={styles.budget}>
            Budget: ${request.estimated_budget}
          </span>
          <span className={styles.date}>
            Shared: {new Date(request.share_date).toLocaleDateString()}
          </span>
          {request.is_new && <span className={styles.newBadge}>New</span>}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <button
            onClick={handleViewDetails}
            className={styles.viewButton}
            disabled={loading}
          >
            <span className={styles.buttonContent}>
              <FileText size={16} />
              <span>View Details</span>
            </span>
          </button>
          <button
            onClick={checkSubscriptionAndStartConversation}
            className={styles.conversationButton}
            disabled={loading}
          >
            <span className={styles.buttonContent}>
              <MessageSquare size={16} />
              <span>{loading ? 'Please wait...' : 'Start Conversation'}</span>
            </span>
          </button>
        </div>
      </div>

      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSuccess={async () => {
          setShowSubscriptionDialog(false);
          try {
            const subscriptionCheck = await api.subscriptions.getStatus();
            if (subscriptionCheck?.status === 'active') {
              const response = await api.conversations.create({
                request_id: request.id,
              });
              navigate(`/conversations/${response.id}`);
            }
          } catch (err) {
            console.error('Failed to verify subscription after payment:', err);
            setError('Failed to verify subscription. Please try again.');
          }
        }}
      />
    </div>
  );
};

export default SharedRequestCard;
