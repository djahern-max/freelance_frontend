// SharedRequestNotification.js
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import SharedRequestCard from './SharedRequestCard';
import styles from './SharedRequestNotification.module.css';

const SharedRequestNotification = () => {
  const [newShares, setNewShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchSharedRequests = async () => {
      if (user?.userType !== 'developer') return;

      try {
        const response = await api.get('/requests/shared-with-me');
        // Remove duplicates based on request ID
        const uniqueRequests = Array.from(
          new Map(response.data.map((item) => [item.id, item])).values()
        );
        const unviewedShares = uniqueRequests.filter((req) => !req.viewed_at);
        setNewShares(unviewedShares);
      } catch (error) {
        console.error('Error fetching shared requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedRequests();
    const interval = setInterval(fetchSharedRequests, 30000);
    return () => clearInterval(interval);
  }, [user]);

  if (loading || newShares.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.notificationBadge}>
        <Bell className={styles.bellIcon} />
        <span className={styles.count}>{newShares.length}</span>
        <div className={styles.tooltip}>
          You have {newShares.length} new shared requests
        </div>
      </div>
      <div className={styles.requestsList}>
        {newShares.map((request) => (
          <SharedRequestCard key={request.id} request={request} />
        ))}
      </div>
    </div>
  );
};

export default SharedRequestNotification;
