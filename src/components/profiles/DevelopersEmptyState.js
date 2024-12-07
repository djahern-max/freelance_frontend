import { PlusCircle, RefreshCw, UserPlus, Users } from 'lucide-react';
import styles from './DevelopersEmptyState.module.css';

const DevelopersEmptyState = ({
  isAuthenticated,
  userType,
  onCreateProfile,
  onSignUp,
  error,
  onRetry,
}) => {
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
          <Users className={styles.icon} size={48} />
        </div>

        <h2 className={styles.title}>No Creators Available</h2>

        <div className={styles.actionWrapper}>
          {!isAuthenticated ? (
            <button className={styles.primaryButton} onClick={onSignUp}>
              <UserPlus size={20} />
              <span>Join as a Creator</span>
            </button>
          ) : (
            userType === 'developer' && (
              <button
                className={styles.primaryButton}
                onClick={onCreateProfile}
              >
                <PlusCircle size={20} />
                <span>Create Developer Profile</span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default DevelopersEmptyState;
