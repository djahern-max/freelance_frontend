// src/components/feedback/FeedbackModal.js
import { Star } from 'lucide-react';
import { useState } from 'react';
import styles from './Feedback.module.css';

const FeedbackModal = ({ onClose, location, targetId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit({ rating, comment, location, targetId });
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Share Your Feedback</h2>
          <p className={styles.modalDescription}>
            Help us improve your experience
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.ratingButton} ${
                  value <= rating ? styles.active : ''
                }`}
                onClick={() => setRating(value)}
              >
                <Star size={16} />
              </button>
            ))}
          </div>

          <div className={styles.textareaContainer}>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you think..."
              className={styles.textarea}
            />
          </div>

          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !rating}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
