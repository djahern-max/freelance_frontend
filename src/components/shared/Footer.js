import { MessageSquareMore, Heart, Coffee } from 'lucide-react';
import { useState } from 'react';
import FeedbackModal from '../feedback/FeedbackModal';
import DonationModal from '../payments/DonationModal';
import styles from './Footer.module.css';

const Footer = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [isHeartHovered, setIsHeartHovered] = useState(false);
  const [isFeedbackHovered, setIsFeedbackHovered] = useState(false);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.section}>
          <button
            className={styles.donateButton}
            onClick={() => setShowDonationModal(true)}
            onMouseEnter={() => setIsHeartHovered(true)}
            onMouseLeave={() => setIsHeartHovered(false)}
          >
            <Heart
              size={18}
              className={styles.buttonIcon}
              fill={isHeartHovered ? '#ef4444' : 'none'}
            />
            <span>Support RYZE.ai</span>
          </button>
        </div>

        <div className={`${styles.section} ${styles.centerSection}`}>
          <div className={styles.supportText}>
            <Coffee size={16} />
            <span>Help us empower more creators</span>
          </div>
        </div>

        <div className={`${styles.section} ${styles.rightSection}`}>
          <button
            className={styles.feedbackButton}
            onClick={() => setShowFeedbackModal(true)}
            onMouseEnter={() => setIsFeedbackHovered(true)}
            onMouseLeave={() => setIsFeedbackHovered(false)}
          >
            <MessageSquareMore
              size={18}
              className={styles.buttonIcon}
            />
            <span>Feedback</span>
          </button>
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          location="footer"
          targetId="general_feedback"
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {showDonationModal && (
        <DonationModal onClose={() => setShowDonationModal(false)} />
      )}
    </footer>
  );
};

export default Footer;