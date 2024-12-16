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

  const renderStarSet = (
    value,
    isInteractive = false,
    label = '',
    showCount = false
  ) => (
    <div className={styles.starSetContainer}>
      <div className={styles.starSetLabel}>{label}</div>
      <div className={styles.starsRow}>
        {Array.from({ length: 5 }, (_, index) => {
          const starValue = index + 1;
          const isFilled =
            starValue <=
            (isInteractive ? hoverRating || userRating || 0 : value);

          return (
            <button
              key={starValue}
              type="button"
              onClick={() => isInteractive && handleRate(starValue)}
              onMouseEnter={() => isInteractive && setHoverRating(starValue)}
              onMouseLeave={() => isInteractive && setHoverRating(0)}
              className={`${styles.starButton} ${
                !isInteractive ? styles.nonInteractive : ''
              } ${isSubmitting ? styles.submitting : ''}`}
              disabled={!isInteractive || isSubmitting}
              aria-label={`Rate ${starValue} star${starValue !== 1 ? 's' : ''}`}
            >
              <Star
                className={`${styles.star} ${isFilled ? styles.filled : ''}`}
                size={size}
              />
            </button>
          );
        })}
      </div>
      {showCount && (
        <div className={styles.ratingCount}>
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      {userRating ? (
        <>
          {renderStarSet(userRating, true, 'Your rating')}
          <div className={styles.divider} />
          {renderStarSet(rating, false, 'Average rating', true)}
        </>
      ) : (
        <>
          {renderStarSet(rating, true)}
          <div className={styles.averageRating}>
            {rating.toFixed(1)} avg from {totalRatings}{' '}
            {totalRatings === 1 ? 'rating' : 'ratings'}
          </div>
        </>
      )}
      {interactive && !userRating && (
        <div className={styles.ratingHelp}>Click a star to rate</div>
      )}
    </div>
  );
};

export default StarRating;
