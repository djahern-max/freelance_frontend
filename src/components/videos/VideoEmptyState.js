import { PlayCircle, PlusCircle, RefreshCw, UserPlus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './VideoEmptyState.module.css';

const VideoEmptyState = ({
  isAuthenticated,
  userType,
  onCreateVideo,
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
          <PlayCircle className={styles.icon} size={48} />
        </div>

        <h2 className={styles.title}>No Videos Available</h2>

        <div className={styles.actionWrapper}>
          {!isAuthenticated ? (
            <button className={styles.primaryButton} onClick={handleSignUp}>
              <UserPlus size={20} />
              <span>Sign Up Now</span>
            </button>
          ) : (
            <button className={styles.primaryButton} onClick={onCreateVideo}>
              <PlusCircle size={20} />
              <span>Upload Your First Video</span>
            </button>
          )}
        </div>

        <p className={styles.footer}>
          {isAuthenticated
            ? 'Share your knowledge and expertise with the community.'
            : ''}
        </p>
      </div>
    </div>
  );
};

export default VideoEmptyState;
