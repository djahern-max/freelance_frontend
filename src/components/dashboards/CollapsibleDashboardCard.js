import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import styles from './CollapsibleDashboardCard.module.css';

const CollapsibleDashboardCard = ({ title, count, icon: Icon, children }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={styles.cardHeader}
      >
        <div className={styles.headerContent}>
          <div className={styles.iconContainer}>
            {Icon && <Icon className={styles.icon} />}
          </div>
          <div className={styles.titleContainer}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.count}>{count} Total</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className={styles.chevron} />
        ) : (
          <ChevronDown className={styles.chevron} />
        )}
      </button>

      {isExpanded && <div className={styles.cardContent}>{children}</div>}
    </div>
  );
};

export default CollapsibleDashboardCard;
