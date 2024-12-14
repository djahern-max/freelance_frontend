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
      await api.put(
        `/requests/${requestId}/privacy?is_public=${!currentStatus}`
      );
      onUpdate();
    } catch (error) {
      console.error('Failed to update privacy:', error);
      setError(
        api.helpers.handleError(error) || 'Unable to update privacy settings'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    setIsUpdating(true);
    setError(null);
    try {
      await api.put(`/requests/${requestId}`, {
        status: newStatus,
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to update status:', error);
      setError(
        api.helpers.handleError(error) || 'Unable to update request status'
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      open: 'open',
      in_progress: 'inProgress',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    return statusMap[status.toLowerCase()] || 'open';
  };

  return (
    <div
      className={`${styles.requestCard} ${isUpdating ? styles.loading : ''}`}
    >
      <div>
        <h3 className={styles.title}>{request.title}</h3>
        <p className={styles.content}>{request.content}</p>
      </div>

      <div className={styles.metaContainer}>
        <div className={styles.statusControl}>
          <select
            value={request.status}
            onChange={(e) => updateRequestStatus(request.id, e.target.value)}
            disabled={isUpdating}
            className={`${styles.statusSelect} ${
              styles[getStatusClass(request.status)]
            }`}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {request.estimated_budget && (
          <span className={styles.budgetBadge}>
            Budget: ${request.estimated_budget}
          </span>
        )}

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

      {error && <div className={styles.error}>{error}</div>}

      <button
        className={styles.viewDetailsButton}
        onClick={() => navigate(`/requests/${request.id}`)}
      >
        View Details <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default RequestCard;
