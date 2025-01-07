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

  const renderContent = () => {
    if (!isAuthenticated) {
      return {
        title: 'Explore Developer Projects',
        description: 'Sign up to explore developer projects and share your own work.',
        action: (
          <button className={styles.primaryButton} onClick={handleSignUp}>
            <UserPlus size={20} />
            <span>Sign Up Now</span>
          </button>
        )
      };
    }

    if (userType === 'client') {
      return {
        title: 'Developer Showcases',
        description: 'Coming Soon.',
        // No action button for clients since they can't create showcases
      };
    }

    return {
      title: 'No Project Showcases Yet',
      description: 'Share your best projects with the community and attract potential clients.',
      action: (
        <button className={styles.primaryButton} onClick={onCreateShowcase}>
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
      </div>
    </div>
  );
};

export default ShowcaseEmptyState;
