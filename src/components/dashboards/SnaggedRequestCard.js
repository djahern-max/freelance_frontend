// src/components/dashboards/SnaggedRequestsCard.js
import { AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../utils/api';
import styles from './SnaggedRequestsCard.module.css';

const SnaggedRequestsCard = () => {
  const [snaggedRequests, setSnaggedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSnaggedRequests = async () => {
      try {
        const response = await api.get('/snagged-requests/');
        setSnaggedRequests(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load snagged requests');
        console.error('Error fetching snagged requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSnaggedRequests();
  }, []);

  const handleRemoveRequest = async (requestId) => {
    try {
      await api.delete(`/snagged-requests/${requestId}`);
      setSnaggedRequests((prevRequests) =>
        prevRequests.filter((req) => req.request_id !== requestId)
      );
    } catch (err) {
      console.error('Error removing snagged request:', err);
    }
  };

  if (loading) {
    return (
      <div className={styles.card}>
        <h2 className={styles.title}>Snagged Requests</h2>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.card}>
        <div className={styles.alert}>
          <AlertCircle className={styles.alertIcon} />
          <div className={styles.alertContent}>
            <h3 className={styles.alertTitle}>Error</h3>
            <p className={styles.alertDescription}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Snagged Requests</h2>

      {snaggedRequests.length === 0 ? (
        <p className={styles.emptyText}>No snagged requests yet</p>
      ) : (
        <div className={styles.requestList}>
          {snaggedRequests.map((item) => (
            <div key={item.id} className={styles.requestItem}>
              <div className={styles.requestHeader}>
                <div className={styles.requestInfo}>
                  <h3 className={styles.requestTitle}>{item.request.title}</h3>
                  <p className={styles.requestMeta}>
                    By {item.request.owner_username}
                  </p>
                  {item.request.estimated_budget && (
                    <p className={styles.requestMeta}>
                      Budget: ${item.request.estimated_budget}
                    </p>
                  )}
                  <p className={styles.requestMeta}>
                    Status: {item.request.status}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveRequest(item.request_id)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              </div>
              <p className={styles.requestContent}>
                {item.request.content.length > 150
                  ? `${item.request.content.substring(0, 150)}...`
                  : item.request.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SnaggedRequestsCard;
