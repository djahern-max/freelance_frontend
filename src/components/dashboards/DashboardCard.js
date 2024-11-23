// DashboardCard.js
import { Activity, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardCard.module.css';

const DashboardCard = ({ title, count, description, type }) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    switch (type) {
      case 'projects':
        navigate('/projects');
        break;
      case 'requests':
        navigate('/requests');
        break;
      case 'conversations':
        navigate('/conversations');
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.statsSection}>
        <div className={styles.iconContainer}>
          <Activity className={styles.icon} />
        </div>
        <div className={styles.textContainer}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.count}>{count}</p>
        </div>
      </div>

      {description && <p className={styles.description}>{description}</p>}

      <button onClick={handleViewAll} className={styles.viewButton}>
        View All
        <ArrowRight className={styles.arrowIcon} />
      </button>
    </div>
  );
};

export default DashboardCard;
