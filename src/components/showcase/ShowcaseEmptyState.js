import {
  Briefcase,
  PlusCircle,
  RefreshCw,
  UserPlus,
  Search,     // Added
  CreditCard  // Added
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './ShowcaseEmptyState.module.css';

const ShowcaseEmptyState = ({
  isAuthenticated,
  userType,
  onCreateShowcase,
  error,
  onRetry,
  isLoading
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const subscriptionStatus = useSelector(state => state.auth.subscriptionStatus);

  const handleSignUp = () => {
    navigate('/register', {
      state: { from: location.pathname },
    });
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return {
        title: 'Explore Developer Projects',
        description: 'Sign up to explore developer projects and share your own work.',
        action: (
          <button
            className={styles.primaryButton}
            onClick={handleSignUp}
            disabled={isLoading}
          >
            <UserPlus size={20} />
            <span>Sign Up Now</span>
          </button>
        )
      };
    }

    if (userType === 'client') {
      return {
        title: 'Developer Showcases',
        description: 'Browse through developer portfolios and project showcases.',
        // Optional: Add a search or browse button for clients
        action: (
          <button
            className={styles.secondaryButton}
            onClick={() => navigate('/developers')}
          >
            <Search size={20} />
            <span>Browse Developers</span>
          </button>
        )
      };
    }

    // Developer view
    if (subscriptionStatus !== 'active') {
      return {
        title: 'Showcase Your Projects',
        description: 'Upgrade your account to create project showcases and attract more clients.',
        action: (
          <button
            className={styles.primaryButton}
            onClick={() => navigate('/subscription')}
          >
            <CreditCard size={20} />
            <span>Upgrade Account</span>
          </button>
        )
      };
    }

    return {
      title: 'No Project Showcases Yet',
      description: 'Share your best projects with the community and attract potential clients.',
      action: (
        <button
          className={styles.primaryButton}
          onClick={onCreateShowcase}
          disabled={isLoading}
        >
          <PlusCircle size={20} />
          <span>Create Your First Showcase</span>
        </button>
      ),
      footer: 'Share your projects to showcase your skills and attract potential clients'
    };
  };

  const content = renderContent();

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.alert} role="alert">
          <div className={styles.alertContent}>
            <span>{error}</span>
            <button
              className={styles.retryButton}
              onClick={onRetry}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? styles.spinning : ''} />
              <span>{isLoading ? 'Retrying...' : 'Try Again'}</span>
            </button>
          </div>
        </div>
      )}

      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <Briefcase
            className={`${styles.icon} ${error ? styles.errorIcon : ''}`}
            size={48}
          />
        </div>

        <h2 className={styles.title}>{content.title}</h2>
        <p className={styles.description}>{content.description}</p>

        {content.action && (
          <div className={styles.actionWrapper}>
            {content.action}
          </div>
        )}

        {content.footer && (
          <p className={styles.footer}>{content.footer}</p>
        )}

        {isLoading && (
          <div className={styles.loadingOverlay}>
            <RefreshCw size={24} className={styles.spinning} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowcaseEmptyState;