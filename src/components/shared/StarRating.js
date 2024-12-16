import { Star } from 'lucide-react';
import { useCallback, useState } from 'react';
import styles from './StarRating.module.css';

const StarRating = ({
  rating,
  totalRatings,
  interactive = false,
  onRate = null,
  userRating = null,
  size = 24,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = useCallback(
    async (selectedRating) => {
      if (!interactive || !onRate || isSubmitting) return;

      setIsSubmitting(true);
      try {
        setHoverRating(selectedRating);
        await onRate(selectedRating);
      } finally {
        setIsSubmitting(false);
      }
    },
    [interactive, onRate, isSubmitting]
  );

  const stars = Array.from({ length: 5 }, (_, index) => {
    const starValue = index + 1;
    const isFilled = starValue <= (hoverRating || rating);
    const isUserRated = starValue === userRating;

    return (
      <button
        key={starValue}
        type="button"
        onClick={() => handleRate(starValue)}
        onMouseEnter={() => interactive && setHoverRating(starValue)}
        onMouseLeave={() => setHoverRating(0)}
        className={`${styles.starButton} ${
          !interactive ? styles.nonInteractive : ''
        } ${isSubmitting ? styles.submitting : ''}`}
        disabled={!interactive || isSubmitting}
        aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
      >
        <Star
          className={`${styles.star} ${isFilled ? styles.filled : ''} 
            ${isUserRated ? styles.userRated : ''}`}
          size={size}
        />
      </button>
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.starsContainer}>{stars}</div>
      {totalRatings > 0 && (
        <div className={styles.averageRating}>
          <span className={styles.ratingAverage}>{rating.toFixed(1)}</span>
          <span className={styles.ratingCount}>
            avg from {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
          </span>
        </div>
      )}
      {interactive && (
        <div className={styles.ratingHelp}>
          {userRating
            ? 'Click a star to change your rating'
            : 'Click a star to rate'}
        </div>
      )}
    </div>
  );
};

export default StarRating;
