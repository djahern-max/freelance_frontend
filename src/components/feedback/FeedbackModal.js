import { Star, X } from 'lucide-react';
import { useState } from 'react';
import styles from './FeedbackModal.module.css';

const FeedbackModal = ({ location, targetId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleOverlayClick = (e) => {
    // Prevent closing if clicking inside the modal content
    if (e.target.classList.contains(styles.overlay)) {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/feedback/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating,
            comment,
            name,
            email,
            location,
            target_id: targetId,
          }),
        }
      );

      // Handle the response as needed
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Feedback submitted successfully:', data);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }

    setSuccess(true);
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Share Your Feedback</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            Thank you for your feedback!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Rating</label>
              <div className={styles.starContainer}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={styles.starButton}
                  >
                    <Star
                      className={`${styles.star} ${
                        value <= rating ? styles.starActive : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Name (optional)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Your name"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                placeholder="Your email"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={styles.textarea}
                rows="4"
                placeholder="Share your experience..."
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.buttonContainer}>
              <button type="submit" className={styles.submitButton}>
                Submit Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
