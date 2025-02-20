import React from 'react';
import { Clock, MessageSquare, Users, Handshake, Lightbulb } from 'lucide-react';
import styles from './PublicRequestCard.module.css';

const PublicRequestCard = ({
  request,
  onSnag,
  onCardClick,
  isExpanded,
  onToggleExpand,
  conversations
}) => {
  const getResponseText = () => {
    const count = conversations?.[request.id] || 0;
    return `${count} ${count === 1 ? 'response' : 'responses'}`;
  };

  const getSnagButton = () => {
    if (request.status?.toLowerCase() === 'open') {
      if (request.is_idea) {
        const buttonStyle = request.seeks_collaboration ? styles.collaborateButton : styles.ideaButton;
        const buttonText = request.seeks_collaboration ? 'Collaborate' : 'Idea';
        return (
          <span
            className={`${styles.snagButton} ${buttonStyle}`}
            role="button"
            onClick={(e) => {
              e.stopPropagation();
              onSnag(request.id);
            }}
          >
            <span className={styles.snagText}>{buttonText}</span>
          </span>
        );
      }
      return (
        <span
          className={`${styles.snagButton} ${styles.snagButtonEnabled}`}
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onSnag(request.id);
          }}
        >
          <span className={styles.snagText}>Connect</span>
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
    const baseStatus = request.status?.toLowerCase() || 'open';

    // Handle special cases for ideas and collaborations
    if (request.is_idea) {
      return request.seeks_collaboration ? styles.statusCollaboration : styles.statusIdea;
    }

    // Map regular statuses to their respective classes
    switch (baseStatus) {
      case 'open':
        return styles.statusOpen;
      case 'in_progress':
        return styles.statusInProgress;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusOpen;
    }
  };

  const getTypeBadge = () => {
    if (!request.is_idea) return null;

    return (
      <div className={`${styles.typeBadge} ${request.seeks_collaboration ? styles.collaboration : styles.idea}`}>
        {request.seeks_collaboration ? (
          <>
            <Handshake size={16} />
            <span>Collaboration Opportunity</span>
          </>
        ) : (
          <>
            <Lightbulb size={16} />
            <span>Idea</span>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={`${styles.card}`}
      onClick={() => onCardClick(request)}
      data-expanded={isExpanded}
    >
      <div className={`${styles.statusIndicator} ${getStatusClass()}`}>
        {request.is_idea
          ? (request.seeks_collaboration ? 'COLLABORATION' : 'IDEA')
          : request.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
      </div>

      {getSnagButton()}
      {getTypeBadge()}

      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>{request.title}</h2>
          {!request.is_idea && request.estimated_budget && (
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
              {request.content.length > 200 && isExpanded && (
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

        {request.is_idea && request.seeks_collaboration && request.collaboration_details && (
          <div className={styles.collaborationDetails}>
            <Handshake size={16} className={styles.inline} />
            {request.collaboration_details}
          </div>
        )}
        <div className={styles.metaInfo}>
          <div className={styles.metaItem}>
            <Clock size={16} />
            <span>{new Date(request.created_at).toLocaleDateString()}</span>
          </div>
          <div className={styles.metaItem}>
            <MessageSquare size={16} />
            <span>{getResponseText()}</span>
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