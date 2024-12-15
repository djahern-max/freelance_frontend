import { Star, StarHalf } from 'lucide-react';
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
    if (i <= fullStars) {
      stars.push(
        <Star
          key={i}
          className={`${styles.star} ${interactive ? styles.interactive : ''} ${
            userRating === i ? styles.userRated : styles.filled
          }`}
          size={size}
          fill="currentColor"
          onClick={() => handleClick(i)}
        />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <StarHalf
          key={i}
          className={`${styles.star} ${interactive ? styles.interactive : ''}`}
          size={size}
          fill="currentColor"
          color="#FAC920"
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          className={`${styles.star} ${interactive ? styles.interactive : ''} ${
            styles.empty
          }`}
          size={size}
          onClick={() => handleClick(i)}
        />
      );
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.starsContainer}>{stars}</div>
      {totalRatings !== undefined && (
        <span className={styles.ratingCount}>
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
