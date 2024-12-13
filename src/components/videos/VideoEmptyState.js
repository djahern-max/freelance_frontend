// VideoEmptyState.js
import { PlayCircle, PlusCircle, RefreshCw, UserPlus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './VideoEmptyState.module.css';

const VideoEmptyState = ({
  isAuthenticated,
  userType,
  onCreateVideo,
  error,
  onRetry,
  onSignUp,
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

        <h2 className={styles.title}>
          {isAuthenticated
            ? 'No Videos Available Yet'
            : 'Explore Creator Videos'}
        </h2>

        <p className={styles.description}>
          {isAuthenticated
            ? 'Be the first to share your knowledge and expertise with the community.'
            : 'Sign up to access creator videos and share your own content.'}
        </p>

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

        {userType === 'developer' && isAuthenticated && (
          <p className={styles.footer}>
            Share your expertise through videos to attract potential clients
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoEmptyState;
