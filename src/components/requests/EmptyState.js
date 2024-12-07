import { MessageSquare, PlusCircle, RefreshCw, UserPlus } from 'lucide-react';
import styles from './EmptyState.module.css';

const EmptyState = ({
  isAuthenticated,
  userType,
  onCreateProject,
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
          <MessageSquare className={styles.icon} size={48} />
        </div>

        <h2 className={styles.title}>No Projects Available</h2>

        <div className={styles.actionWrapper}>
          {!isAuthenticated ? (
            <button className={styles.primaryButton} onClick={onSignUp}>
              <UserPlus size={20} />
              <span>Sign Up Now</span>
            </button>
          ) : (
            userType === 'client' && (
              <button
                className={styles.primaryButton}
                onClick={onCreateProject}
              >
                <PlusCircle size={20} />
                <span>Create Your First Project</span>
              </button>
            )
          )}
        </div>

        <p className={styles.footer}>
          {isAuthenticated ? 'Please check back soon!.' : ''}
        </p>
      </div>
    </div>
  );
};

export default EmptyState;
