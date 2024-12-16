import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import ratingService from '../../utils/ratingService';
import StarRating from '../shared/StarRating';
import styles from './DeveloperRatingSection.module.css';

const DeveloperRatingSection = ({ developerId }) => {
  const [ratingState, setRatingState] = useState({
    averageRating: 0,
    totalRatings: 0,
    userRating: null,
    loading: true,
    error: null,
  });

  const user = useSelector((state) => state.auth.user);

  const loadRatings = useCallback(async () => {
    if (!developerId) return;

    try {
      setRatingState((prev) => ({ ...prev, loading: true, error: null }));
      const ratingStats = await ratingService.getDeveloperRating(developerId);

      setRatingState({
        averageRating: ratingStats.average_rating ?? 0,
        totalRatings: ratingStats.total_ratings ?? 0,
        userRating: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      setRatingState((prev) => ({
        ...prev,
        loading: false,
        error: 'Unable to load ratings',
      }));
    }
  }, [developerId]);

  useEffect(() => {
    loadRatings();
  }, [loadRatings]);

  const handleRate = async (stars) => {
    try {
      const response = await ratingService.rateDeveloper(developerId, {
        stars,
        comment: '',
      });

      setRatingState((prev) => ({
        ...prev,
        averageRating: response.average_rating,
        totalRatings: response.total_ratings,
        userRating: stars,
      }));
    } catch (error) {
      setRatingState((prev) => ({
        ...prev,
        error: 'Unable to submit rating',
      }));
    }
  };

  if (!developerId || ratingState.loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (ratingState.error) {
    return <div className={styles.error}>{ratingState.error}</div>;
  }

  return (
    <div className={styles.container}>
      <StarRating
        rating={ratingState.averageRating}
        totalRatings={ratingState.totalRatings}
        interactive={true}
        onRate={handleRate}
        userRating={ratingState.userRating}
      />
      {ratingState.totalRatings === 0 && (
        <p className={styles.noRatings}>Be the first to rate this developer</p>
      )}
    </div>
  );
};

export default DeveloperRatingSection;
