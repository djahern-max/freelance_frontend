import { Calendar, Clock, DollarSign, Eye, User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SubscriptionDialog from '../payments/SubscriptionDialog';
import styles from './SharedRequestCard.module.css';

const SharedRequestCard = ({ request }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = () => {
    navigate(`/requests/${request.id}`);
  };

  const checkSubscriptionAndProceed = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Checking subscription status...');
      const { data } = await api.get('/payments/subscription-status');
      console.log('Subscription status:', data);

      if (data && data.status === 'active') {
        console.log('Subscription is active, starting conversation...');
        await startConversation();
      } else {
        console.log('No active subscription, showing dialog...');
        localStorage.setItem('pending_conversation_request_id', request.id);
        setShowSubscriptionDialog(true);
      }
    } catch (err) {
      console.error('Error checking subscription:', err);
      if (err.response?.status === 403) {
        localStorage.setItem('pending_conversation_request_id', request.id);
        setShowSubscriptionDialog(true);
      } else {
        setError(api.helpers.handleError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async () => {
    try {
      console.log('Creating conversation for request:', request.id);
      const response = await api.post('/conversations/', {
        request_id: request.id,
      });

      if (response.data && response.data.id) {
        console.log('Conversation created successfully:', response.data.id);
        navigate(`/conversations/${response.data.id}`);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      if (err.response?.status === 403) {
        localStorage.setItem('pending_conversation_request_id', request.id);
        setShowSubscriptionDialog(true);
      } else {
        setError(api.helpers.handleError(err));
      }
    }
  };

  const handleSubscriptionDialogClose = () => {
    setShowSubscriptionDialog(false);
    localStorage.removeItem('pending_conversation_request_id');
  };

  return (
    <div className={`${styles.card} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{request.title}</h3>
        {request.is_new && <span className={styles.newBadge}>New</span>}
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <User className={styles.icon} />
          <span>Shared by: {request.owner_username}</span>
        </div>
        <div className={styles.metaItem}>
          <Calendar className={styles.icon} />
          <span>Shared: {formatDate(request.share_date)}</span>
        </div>
        {request.estimated_budget && (
          <div className={styles.metaItem}>
            <DollarSign className={styles.icon} />
            <span>Budget: ${request.estimated_budget}</span>
          </div>
        )}
        <div className={styles.metaItem}>
          <Clock className={styles.icon} />
          <span>Status: {request.status || 'Open'}</span>
        </div>
      </div>

      <div className={`${styles.content} ${isExpanded ? styles.expanded : ''}`}>
        {request.content}
      </div>

      <div className={styles.actions}>
        <button
          onClick={handleViewDetails}
          className={styles.actionButton}
          disabled={loading}
        >
          View Details
        </button>
        <button
          onClick={checkSubscriptionAndProceed}
          className={`${styles.actionButton} ${styles.primaryButton}`}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Start Conversation'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={styles.expandButton}
      >
        {isExpanded ? 'Show less' : 'Show more'}
      </button>

      {!request.is_new && (
        <div className={styles.viewedIndicator}>
          <Eye className={styles.viewedIcon} />
          <span>Viewed</span>
        </div>
      )}

      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={handleSubscriptionDialogClose}
        onSuccess={() => {
          setShowSubscriptionDialog(false);
          // Don't try to start conversation here - it will happen in SubscriptionSuccess component
        }}
      />
    </div>
  );
};

export default SharedRequestCard;
