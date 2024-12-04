// src/components/feedback/FeedBackButton.js
import { MessageSquare } from 'lucide-react'; // Using MessageSquare instead of ThumbsUp
import { useState } from 'react';
import styles from './Feedback.module.css';
import FeedbackPrompt from './FeedbackPrompt';

const FeedBackButton = ({ location, targetId }) => {
  const [showPrompt, setShowPrompt] = useState(false);

  return (
    <div className={styles.headerFeedback}>
      {' '}
      {/* Changed from container to headerFeedback */}
      <button
        className={styles.feedbackButton}
        onClick={() => setShowPrompt(true)}
        title="Give Feedback"
      >
        <MessageSquare size={16} />
        <span>Feedback</span>
      </button>
      {showPrompt && (
        <FeedbackPrompt
          onClose={() => setShowPrompt(false)}
          location={location}
          targetId={targetId}
        />
      )}
    </div>
  );
};

export default FeedBackButton;
