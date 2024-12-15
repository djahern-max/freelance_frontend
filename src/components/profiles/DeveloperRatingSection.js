// src/components/profiles/DeveloperRatingSection.js

import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_ROUTES } from '../../utils/api';
import StarRating from '../shared/StarRating';
import styles from './DeveloperRatingSection.module.css';

const DeveloperRatingSection = ({ developerId }) => {
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const isClient = user?.user_type === 'client';
  const isDeveloper = user?.user_type === 'developer';

  useEffect(() => {
    if (developerId) {
      loadRatings();
    }
  }, [developerId]);

  const loadRatings = async () => {
    try {
      const ratingData = await axios.get(
        `${API_ROUTES.ratings}/developer/${developerId}`
      );
      setAverageRating(ratingData.data.average_rating || 0);
      setTotalRatings(ratingData.data.total_ratings || 0);

      if (isDeveloper) {
        // Fetch the user's rating for the developer
        const userRatingData = await axios.get(
          `${API_ROUTES.ratings}/developer/${developerId}/user-rating`
        );
        setUserRating(userRatingData.data?.rating || null);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        // No ratings found, set default values
        setAverageRating(0);
        setTotalRatings(0);
        setUserRating(null);
      } else {
        console.error('Error loading ratings:', err);
        setError(err);
        toast.error('Failed to load ratings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (stars) => {
    try {
      const response = await axios.post(
        `${API_ROUTES.ratings}/developer/${developerId}`,
        {
          stars: stars,
          comment: '',
        }
      );

      setAverageRating(response.data.average_rating || 0);
      setTotalRatings(response.data.total_ratings || 0);
      setUserRating(stars);
      toast.success(response.data.message || 'Rating submitted successfully');
    } catch (err) {
      console.error('Error submitting rating:', err);
      toast.error('Failed to submit rating');
    }
  };

  if (!developerId) {
    return <div className={styles.container}>Unable to load ratings.</div>;
  }

  if (loading) {
    return <div className={styles.loading}>Loading ratings...</div>;
  }

  if (error) {
    return <div className={styles.container}>Error loading ratings.</div>;
  }

  return (
    <div className={styles.container}>
      {totalRatings === 0 && isClient ? (
        <div className={styles.noRatings}>
          <p>This developer has not been rated yet.</p>
          <p className={styles.ratePrompt}>
            Be the first to rate this developer!
          </p>
        </div>
      ) : (
        <StarRating
          rating={averageRating}
          totalRatings={totalRatings}
          interactive={isClient || isDeveloper}
          onRate={handleRate}
          userRating={userRating}
        />
      )}
    </div>
  );
};

DeveloperRatingSection.defaultProps = {
  developerId: null,
};

export default DeveloperRatingSection;
