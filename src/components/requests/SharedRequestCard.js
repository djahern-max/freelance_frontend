// SharedRequestCard.js
import { Calendar, Clock, DollarSign, Eye, User } from 'lucide-react';
import { useState } from 'react';
import styles from './SharedRequestCard.module.css';

const SharedRequestCard = ({ request }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
    </div>
  );
};

export default SharedRequestCard;
