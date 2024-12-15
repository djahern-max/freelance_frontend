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
  const user = useSelector((state) => state.auth.user);
  const isClient = user?.user_type === 'client';

  useEffect(() => {
    // Only load ratings if we have a valid developerId
    if (developerId) {
      loadRatings();
    }
  }, [developerId]);

  const loadRatings = async () => {
    try {
      if (!developerId) {
        console.error('No developer ID provided');
        return;
      }

      const [ratingData, userRatingData] = await Promise.all([
        axios.get(`${API_ROUTES.ratings}/developer/${developerId}/user-rating`),
        isClient
          ? axios.get(`${API_ROUTES.ratings}/user/${developerId}`)
          : Promise.resolve({ data: { rating: null } }),
      ]);

      setAverageRating(ratingData.data.average_rating || 0);
      setTotalRatings(ratingData.data.total_ratings || 0);
      setUserRating(userRatingData.data?.rating || null);
    } catch (error) {
      console.error('Error loading ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (stars) => {
    try {
      if (!developerId) {
        toast.error('Cannot rate: Developer ID is missing');
        return;
      }

      const response = await axios.post(
        `${API_ROUTES.ratings}/developer/${developerId}`,
        {
          stars: stars, // The backend expects 'stars', not 'rating'
          comment: '', // Optional comment field
        }
      );

      setAverageRating(response.data.average_rating || 0);
      setTotalRatings(response.data.total_ratings || 0);
      setUserRating(stars);
      toast.success(response.data.message || 'Rating submitted successfully');
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  if (!developerId) {
    return null; // Or some fallback UI
  }

  if (loading) {
    return <div className={styles.loading}>Loading ratings...</div>;
  }

  return (
    <div className={styles.container}>
      <StarRating
        rating={averageRating}
        totalRatings={totalRatings}
        interactive={isClient}
        onRate={handleRate}
        userRating={userRating}
      />
      {isClient && !userRating && (
        <p className={styles.ratePrompt}>Click to rate this developer</p>
      )}
    </div>
  );
};

DeveloperRatingSection.defaultProps = {
  developerId: null,
};

export default DeveloperRatingSection;
