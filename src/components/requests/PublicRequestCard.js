import { Clock, MessageSquare, Users } from 'lucide-react';
import styles from './PublicRequestCard.module.css';

const PublicRequestCard = ({
  request,
  onSnag,
  onCardClick,
  isExpanded,
  onToggleExpand,
}) => {
  const getSnagButton = () => {
    if (request.status?.toLowerCase() === 'open') {
      return (
        <span
          className={`${styles.snagButton} ${styles.snagButtonEnabled}`}
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onSnag(request.id);
          }}
          title="Snag this request"
        >
          <span className={styles.snagText}>Snag It</span>
        </span>
      );
    }
    return (
      <span className={`${styles.snagButton} ${styles.snagButtonDisabled}`}>
        Unavailable
      </span>
    );
  };

  const getStatusClass = () => {
    switch (request.status?.toLowerCase()) {
      case 'open':
        return styles.statusOpen;
      case 'in_progress':
        return styles.statusInProgress;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div
      className={styles.card}
      onClick={() => onCardClick(request)}
      data-expanded={isExpanded}
    >
      <div className={`${styles.statusIndicator} ${getStatusClass()}`}>
        {request.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
      </div>
      {getSnagButton()}

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{request.title}</h2>
          {request.estimated_budget && (
            <div className={styles.budget}>
              <span>${request.estimated_budget.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className={styles.description}>
          {request.content.length > 200 && !isExpanded ? (
            <>
              {request.content.substring(0, 200)}
              <span className={styles.fade} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(request.id);
                }}
                className={styles.readMoreButton}
              >
                Read More
              </button>
            </>
          ) : (
            <>
              {request.content}
              {request.content.length > 200 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(request.id);
                  }}
                  className={styles.readMoreButton}
                >
                  Show Less
                </button>
              )}
            </>
          )}
        </div>

        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <Clock size={16} />
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
          <div className={styles.metaItem}>
            <MessageSquare size={16} />
            <span>{request.responses || 0} responses</span>
          </div>
          {request.owner_username && (
            <div className={styles.metaItem}>
              <Users size={16} />
              <span>{request.owner_username}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicRequestCard;
