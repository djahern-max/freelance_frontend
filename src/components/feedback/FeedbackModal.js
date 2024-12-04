import axios from 'axios';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/authSlice';
import styles from './FeedbackModal.module.css';

const FeedbackModal = ({ onClose, location, targetId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector(selectUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post('/api/feedback', {
        rating,
        comment,
        location,
        targetId,
        userId: user.id,
      });

      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Share Your Feedback</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`${styles.star} ${
                  value <= rating ? styles.active : ''
                }`}
                onClick={() => setRating(value)}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you think..."
            className={styles.commentInput}
          />
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              disabled={isSubmitting || !rating}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
