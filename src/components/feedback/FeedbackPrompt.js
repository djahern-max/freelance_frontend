// src/components/feedback/FeedbackPrompt.js
import { ThumbsUp } from 'lucide-react';
import { useState } from 'react';
import styles from './Feedback.module.css';
import FeedbackModal from './FeedbackModal';

const FeedbackPrompt = ({ onClose, location, targetId }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={styles.promptOverlay} onClick={onClose}>
        <div className={styles.promptCard} onClick={(e) => e.stopPropagation()}>
          <div className={styles.iconWrapper}>
            <ThumbsUp className={styles.icon} size={48} />
          </div>

          <h2 className={styles.title}>Help Us Improve</h2>

          <p className={styles.description}>
            Your feedback helps us create a better experience for everyone.
          </p>

          <button
            className={styles.primaryButton}
            onClick={() => setShowModal(true)}
          >
            Share Feedback
          </button>

          <p className={styles.footer}>
            Join hundreds of users who have helped shape our platform.
          </p>
        </div>
      </div>

      {showModal && (
        <FeedbackModal
          onClose={() => {
            setShowModal(false);
            onClose();
          }}
          location={location}
          targetId={targetId}
        />
      )}
    </>
  );
};

export default FeedbackPrompt;
