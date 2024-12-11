import { useEffect, useState } from 'react';
import api from '../../utils/api';
import RequestAgreement from '../conversations/RequestAgreement';
import styles from './ProjectAgreementView.module.css';

const ProjectAgreementView = ({ projectId, requestId, onClose }) => {
  const [request, setRequest] = useState(null);
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch the request details
        const requestResponse = await api.get(`/requests/${requestId}`);
        setRequest(requestResponse.data);

        // Fetch the agreement details
        const agreementResponse = await api.get(
          `/agreements/request/${requestId}`
        );
        setAgreement(agreementResponse.data);

        // Get current user info
        const userResponse = await api.get('/auth/me');
        setCurrentUser(userResponse.data);

        setError(null);
      } catch (err) {
        console.error('Error fetching agreement data:', err);
        setError('Failed to load agreement details');
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchData();
    }
  }, [requestId]);

  const handleAccept = async (agreement) => {
    try {
      await api.post(`/agreements/${agreement.id}/accept`);
      onClose();
    } catch (error) {
      console.error('Error accepting agreement:', error);
    }
  };

  const handlePropose = async (proposalData) => {
    try {
      await api.post('/agreements/', {
        ...proposalData,
        request_id: requestId,
      });
      onClose();
    } catch (error) {
      console.error('Error proposing agreement:', error);
    }
  };

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <div className={`${styles.content} ${styles.slideIn}`}>
        {loading ? (
          <div className={styles.loading}>Loading agreement details...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <RequestAgreement
            request={request}
            existingAgreement={agreement}
            onAccept={handleAccept}
            onPropose={handlePropose}
            onCancel={onClose}
            currentUser={currentUser}
            isLoading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectAgreementView;
