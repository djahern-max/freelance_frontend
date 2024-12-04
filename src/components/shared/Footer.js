import { MessageSquareMore } from 'lucide-react';
import { useState } from 'react';
import FeedbackModal from '../feedback/FeedbackModal';
import styles from './Footer.module.css';

const Footer = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>© 2024 RYZE.ai | All rights reserved.</p>
        <div className={styles.mobileFeedback}>
          <button
            className={styles.feedbackButton}
            onClick={() => setShowFeedbackModal(true)}
          >
            <MessageSquareMore size={20} />
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
    </footer>
  );
};

export default Footer;
