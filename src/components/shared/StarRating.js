import { Star } from 'lucide-react';
import styles from './StarRating.module.css';

const StarRating = ({
  rating,
  totalRatings,
  interactive = false,
  onRate = null,
  userRating = null,
  size = 24,
}) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  const handleClick = (selectedRating) => {
    if (interactive && onRate) {
      onRate(selectedRating);
    }
  };

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <button
        key={i}
        type="button"
        onClick={() => handleClick(i)}
        className={`${styles.starButton} ${
          !interactive ? styles.nonInteractive : ''
        }`}
        disabled={!interactive}
      >
        <Star
          className={`${styles.star} ${
            i <= fullStars || (i === fullStars + 1 && hasHalfStar)
              ? styles.filled
              : ''
          } ${i === userRating ? styles.userRated : ''}`}
          size={size}
        />
      </button>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.starsContainer}>{stars}</div>
    </div>
  );
};

export default StarRating;
