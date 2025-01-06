import React, { useState } from 'react';
import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

const StarRating = ({
  currentRating = 0,
  averageRating = 0,
  totalRatings = 0,
  onRate,
  readOnly = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleStarClick = (rating) => {
    if (!readOnly && onRate) {
      onRate(rating);
    }
  };

  const renderStars = (rating, isInteractive = false) => {
    return (
      <div className={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`${styles.star} 
                            ${isInteractive ? styles.interactive : ''} 
                            ${star <= (isInteractive ? (hoverRating || currentRating) : rating)
                ? styles.filled
                : styles.empty}`
            }
            onMouseEnter={() => isInteractive && setHoverRating(star)}
            onMouseLeave={() => isInteractive && setHoverRating(0)}
            onClick={() => isInteractive && handleStarClick(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.ratingContainer}>
      {!readOnly && (
        <div className={styles.starsRow}>
          {renderStars(currentRating, true)}
          <span className={styles.ratingText}>
            {currentRating > 0 ? `Your rating: ${currentRating}` : 'Rate this'}
          </span>
        </div>
      )}
      <div className={styles.starsRow}>
        {renderStars(averageRating)}
        <span className={styles.ratingText}>
          {averageRating > 0
            ? `${averageRating.toFixed(1)} (${totalRatings} rating${totalRatings !== 1 ? 's' : ''})`
            : 'No ratings yet'}
        </span>
      </div>
    </div>
  );
};

export default StarRating;
