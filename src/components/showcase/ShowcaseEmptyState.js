import {
  Briefcase,
  PlusCircle,
  RefreshCw,
  UserPlus,
  Search,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../../utils/api';
import styles from './ShowcaseEmptyState.module.css';
import SubscriptionDialog from '../payments/SubscriptionDialog';

const ShowcaseEmptyState = ({
  isAuthenticated,
  userType,
  error,
  onRetry,
  isLoading
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const handleSignUp = () => {
    navigate('/register', {
      state: { from: location.pathname },
    });
  };

  const handleCreateShowcase = async () => {
    try {
      // First check subscription status
      const { data: subStatus } = await api.get('/payments/subscription-status');

      if (subStatus.status === 'active') {
        // Has active subscription, proceed to showcase creation
        navigate('/showcase/create');
      } else {
        // No active subscription, show dialog
        localStorage.setItem('pending_showcase_navigation', '/showcase/create');
        setShowSubscriptionDialog(true);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Unauthorized or forbidden, show subscription dialog
        localStorage.setItem('pending_showcase_navigation', '/showcase/create');
        setShowSubscriptionDialog(true);
      } else {
        // Handle other errors
        console.error('Unexpected error:', error);
      }
    }
  };

  const handleSubscriptionDialogClose = () => {
    setShowSubscriptionDialog(false);
    localStorage.removeItem('pending_showcase_navigation');
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionDialog(false);
    // Don't navigate here - it will happen in SubscriptionSuccess component
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

    return {
      title: 'No Project Showcases Yet',
      description: 'Share your best projects with the community and attract potential clients.',
      action: (
        <button
          className={styles.primaryButton}
          onClick={handleCreateShowcase}
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
    <>
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

      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={handleSubscriptionDialogClose}
        onSuccess={handleSubscriptionSuccess}
        returnUrl={localStorage.getItem('pending_showcase_navigation') || '/showcase/create'}
      />
    </>
  );
};

export default ShowcaseEmptyState;