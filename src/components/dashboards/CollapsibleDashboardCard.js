import { useState } from 'react';
import styles from './CollapsibleDashboardCard.module.css';

const CollapsibleDashboardCard = ({
  title,
  count,
  icon: Icon,
  defaultExpanded,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <>
      <div
        className={`${styles.statCard} ${isExpanded ? styles.active : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Icon className={styles.icon} />
        <div className={styles.statInfo}>
          <h3>{title}</h3>
          <p>{count}</p>
        </div>
      </div>
      {isExpanded && (
        <div className={styles.expandedSection}>
          <h2>{title}</h2>
          <div className={styles.expandedContent}>{children}</div>
        </div>
      )}
    </>
  );
};

export default CollapsibleDashboardCard;
