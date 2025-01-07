import { Briefcase, PlusCircle, RefreshCw, UserPlus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ShowcaseEmptyState.module.css';

const ShowcaseEmptyState = ({
  isAuthenticated,
  userType,
  onCreateShowcase,
  error,
  onRetry,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignUp = () => {
    navigate('/register', {
      state: { from: location.pathname },
    });
  };

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.alert} role="alert">
          <div className={styles.alertContent}>
            <span>{error}</span>
            <button className={styles.retryButton} onClick={onRetry}>
              <RefreshCw size={16} />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <Briefcase className={styles.icon} size={48} />
        </div>

        <h2 className={styles.title}>
          {isAuthenticated
            ? 'No Project Showcases Yet'
            : 'Explore Developer Projects'}
        </h2>

        <p className={styles.description}>
          {isAuthenticated
            ? 'Share your best projects with the community and attract potential clients.'
            : 'Sign up to explore developer projects and share your own work.'}
        </p>

        <div className={styles.actionWrapper}>
          {!isAuthenticated ? (
            <button className={styles.primaryButton} onClick={handleSignUp}>
              <UserPlus size={20} />
              <span>Sign Up Now</span>
            </button>
          ) : (
            <button className={styles.primaryButton} onClick={onCreateShowcase}>
              <PlusCircle size={20} />
              <span>Create Your First Showcase</span>
            </button>
          )}
        </div>

        {userType === 'developer' && isAuthenticated && (
          <p className={styles.footer}>
            Share your projects to showcase your skills and attract potential clients
          </p>
        )}
      </div>
    </div>
  );
};

export default ShowcaseEmptyState;
