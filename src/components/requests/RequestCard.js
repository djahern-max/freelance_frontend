import { ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './RequestCard.module.css';

const RequestCard = ({ request, onUpdate }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [localRequest, setLocalRequest] = useState(request);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    setLocalRequest(request);
  }, [request]);

  // Log the request object to see its structure
  useEffect(() => {
    console.log('Request object:', request);
    console.log('Local request object:', localRequest);
  }, [request, localRequest]);

  const toggleRequestPrivacy = () => {
    // First, log all relevant data
    console.log('Toggle privacy called with:', {
      id: localRequest.id,
      current_is_public: localRequest.is_public,
      token_exists: !!token
    });

    // Use direct property access like in RequestDetails.js
    return api.put(`/requests/${localRequest.id}/privacy`, {
      is_public: !localRequest.is_public
    })
      .then(() => {
        setLocalRequest((prev) => ({
          ...prev,
          is_public: !prev.is_public,
        }));
        toast.success(
          `Request is now ${!localRequest.is_public ? 'public' : 'private'}`
        );
        if (onUpdate) onUpdate();
      })
      .catch((error) => {
        // Log the complete error
        console.error('Error details:', {
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers,
          config: error.config
        });

        toast.error('Failed to update request privacy');
        setLocalRequest((prev) => ({
          ...prev,
          is_public: prev.is_public,
        }));
      });
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    setIsUpdating(true);
    setError(null);

    try {
      const formattedStatus = newStatus.toLowerCase().replace(' ', '_');
      const response = await api.put(`/requests/${requestId}`, {
        status: formattedStatus,
        is_idea: localRequest.is_idea || false,
        seeks_collaboration: localRequest.seeks_collaboration || false
      });

      if (response?.data) {
        setLocalRequest(response.data);
        if (onUpdate) onUpdate();
        toast.success('Status updated successfully');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
      setError(error.response?.data?.detail || 'Unable to update request status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      open: styles.open,
      in_progress: styles.inProgress,
      completed: styles.completed,
      cancelled: styles.cancelled
    };
    return statusMap[status?.toLowerCase()] || styles.open;
  };

  if (!localRequest) {
    return null;
  }

  return (
    <div className={`${styles.requestCard} ${isUpdating ? styles.loading : ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>{localRequest.title}</h3>
        {localRequest.estimated_budget && (
          <div className={styles.budgetBadge}>
            Budget: ${localRequest.estimated_budget}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <p className={styles.description}>
          {localRequest.content?.length > 200
            ? `${localRequest.content.substring(0, 200)}...`
            : localRequest.content}
        </p>
      </div>

      <div className={styles.statusSection}>
        <select
          value={localRequest.status || 'open'}
          onChange={(e) => updateRequestStatus(localRequest.id, e.target.value)}
          disabled={isUpdating}
          className={`${styles.statusSelect} ${getStatusClass(localRequest.status)}`}
        >
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className={styles.footer}>
        <div className={styles.actionButtons}>
          <button
            className={styles.viewDetailsButton}
            onClick={() => navigate(`/requests/${localRequest.id}`)}
            disabled={isUpdating}
          >
            View Details <ChevronRight size={16} />
          </button>
        </div>

        <div className={styles.privacyControl}>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={localRequest.is_public}
              onChange={toggleRequestPrivacy}
              disabled={isUpdating}
            />
            <span className={styles.slider}></span>
          </label>
          <span className={styles.privacyLabel}>
            {isUpdating ? 'Updating...' : localRequest.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button
            onClick={() => setError(null)}
            className={styles.dismissError}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;