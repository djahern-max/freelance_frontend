// RequestCard.js
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import styles from './RequestCard.module.css';

const RequestCard = ({ request, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const updateRequestStatus = async (requestId, newStatus) => {
    setIsUpdating(true);
    setError(null);
    try {
      const formattedStatus = newStatus.toLowerCase().replace(' ', '_');
      const response = await api.put(`/requests/${requestId}`, {
        status: formattedStatus,
      });

      if (response?.data) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      setError(
        error.response?.data?.detail || 'Unable to update request status'
      );
    } finally {
      setIsUpdating(false);
    }
  };

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
      <div className={styles.header}>
        <h3 className={styles.title}>{request.title}</h3>
        {request.estimated_budget && (
          <div className={styles.budgetBadge}>
            Budget: ${request.estimated_budget}
          </div>
        )}
      </div>

      <div className={styles.statusSection}>
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

      <div className={styles.footer}>
        <button
          className={styles.viewDetailsButton}
          onClick={() => navigate(`/requests/${request.id}`)}
        >
          View Details <ChevronRight size={16} />
        </button>

        <div className={styles.privacyControl}>
          <label className={styles.toggleSwitch}>
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
          <span className={styles.privacyLabel}>
            {isUpdating
              ? 'Updating...'
              : request.is_public
              ? 'Public'
              : 'Private'}
          </span>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default RequestCard;
