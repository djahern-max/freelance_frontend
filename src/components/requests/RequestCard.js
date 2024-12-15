import { ChevronRight, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import styles from './RequestCard.module.css';
import SnagTicketModal from './SnagTicketModal';

const RequestCard = ({ request, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showSnagModal, setShowSnagModal] = useState(false);
  const [userVideos, setUserVideos] = useState([]);
  const [profileData, setProfileData] = useState(null);
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

  const loadUserData = async () => {
    try {
      const [videosRes, profileRes] = await Promise.all([
        api.get('/video_display/my-videos'),
        api.get('/profile/developer'),
      ]);
      setUserVideos(videosRes.data);
      setProfileData(profileRes.data);
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load user data');
    }
  };

  const handleSnagTicket = async (data) => {
    setIsUpdating(true);
    setError(null);
    try {
      // Check subscription status first
      const subscriptionRes = await api.get('/payments/subscription-status');
      if (subscriptionRes.data.status !== 'active') {
        navigate('/subscription');
        return;
      }

      // Create the conversation
      const conversationRes = await api.post('/conversations/', {
        request_id: request.id,
        initial_message: data.message,
        video_ids: data.videoIds,
        include_profile: data.includeProfile,
      });

      // Navigate to the new conversation
      navigate(`/conversations/${conversationRes.data.id}`);
    } catch (error) {
      console.error('Failed to snag ticket:', error);
      if (error.response?.status === 403) {
        navigate('/subscription');
      } else {
        setError(error.response?.data?.detail || 'Unable to snag ticket');
      }
    } finally {
      setIsUpdating(false);
      setShowSnagModal(false);
    }
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
        <div className={styles.actionButtons}>
          <button
            className={styles.viewDetailsButton}
            onClick={() => navigate(`/requests/${request.id}`)}
          >
            View Details <ChevronRight size={16} />
          </button>

          <button
            className={styles.snagButton}
            onClick={() => {
              loadUserData();
              setShowSnagModal(true);
            }}
          >
            <MessageSquare size={16} />
            Snag Ticket
          </button>
        </div>

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

      <SnagTicketModal
        isOpen={showSnagModal}
        onClose={() => setShowSnagModal(false)}
        onSubmit={handleSnagTicket}
        videos={userVideos}
        profileUrl={profileData?.profile_url}
      />
    </div>
  );
};

export default RequestCard;
