import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import styles from './RequestCard.module.css';

const RequestCard = ({ request, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const toggleRequestPrivacy = async (requestId, currentStatus) => {
    setIsUpdating(true);
    setError(null);
    try {
      // Adding the proper request body structure
      const response = await api.put(`/requests/${requestId}`, {
        is_public: !currentStatus,
        title: request.title, // Preserve existing values
        content: request.content, // Preserve existing values
        status: request.status, // Preserve existing values
        estimated_budget: request.estimated_budget, // Preserve existing values
      });

      if (response.status === 200) {
        onUpdate(); // Refresh parent component's data
      } else {
        throw new Error('Failed to update privacy settings');
      }
    } catch (error) {
      console.error('Failed to update privacy:', error);
      setError('Unable to update privacy settings');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.requestCard}>
      <div className={styles.requestHeader}>
        <h3>{request.title}</h3>
        <div className={styles.privacyControl}>
          <label
            className={styles.toggleSwitch}
            title={`Make request ${request.is_public ? 'private' : 'public'}`}
          >
            <input
              type="checkbox"
              checked={request.is_public}
              onChange={() =>
                toggleRequestPrivacy(request.id, request.is_public)
              }
              disabled={isUpdating}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.privacyStatus}>
            {isUpdating
              ? 'Updating...'
              : request.is_public
              ? 'Public'
              : 'Private'}
          </span>
        </div>
      </div>

      <p>{request.content}</p>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.requestMeta}>
        <span
          className={`${styles.status} ${styles[request.status.toLowerCase()]}`}
        >
          Status: {request.status}
        </span>
        {request.estimated_budget && (
          <span className={styles.budget}>
            Budget: ${request.estimated_budget}
          </span>
        )}
      </div>

      <button
        onClick={() => navigate(`/requests/${request.id}`)}
        className={styles.viewButton}
      >
        View Details <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default RequestCard;
