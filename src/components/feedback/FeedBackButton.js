import { useState } from 'react';
import { Button } from '../shared/Button';
import styles from './FeedbackButton.module.css';
import FeedbackModal from './FeedbackModal';

const FeedbackButton = ({ location, targetId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.feedbackButtonContainer}>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={styles.feedbackButton}
      >
        Feedback
      </Button>
      {isModalOpen && (
        <FeedbackModal
          onClose={() => setIsModalOpen(false)}
          location={location}
          targetId={targetId}
        />
      )}
    </div>
  );
};

export default FeedbackButton;
