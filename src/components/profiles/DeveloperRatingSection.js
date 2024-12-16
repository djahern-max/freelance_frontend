import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
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

  // Add debugging log for developer ID and user state
  useEffect(() => {
    console.log('DeveloperRatingSection - Props:', {
      developerId,
      userType: user?.user_type,
      userId: user?.id,
    });
  }, [developerId, user]);

  useEffect(() => {
    let isMounted = true;

    const loadRatings = async () => {
      if (!developerId) {
        console.log('No developer ID provided, skipping rating load');
        return;
      }

      try {
        console.log('Loading ratings for developer:', developerId);
        setRatingState((prev) => ({ ...prev, loading: true, error: null }));

        const [ratingStats] = await Promise.all([
          ratingService.getDeveloperRating(developerId).then((stats) => {
            console.log('Received rating stats:', stats);
            return stats;
          }),
        ]);

        if (isMounted) {
          const newState = {
            averageRating: ratingStats.average_rating ?? 0,
            totalRatings: ratingStats.total_ratings ?? 0,
            userRating: null,
            loading: false,
            error: null,
          };
          console.log('Updating rating state to:', newState);
          setRatingState(newState);
        }
      } catch (error) {
        console.error('Error loading ratings - Full error:', error);
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        if (isMounted) {
          const errorMessage =
            error.response?.data?.detail ||
            error.message ||
            'Failed to load ratings';
          setRatingState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          toast.error(errorMessage);
        }
      }
    };

    loadRatings();

    return () => {
      isMounted = false;
    };
  }, [developerId]);

  const handleRate = async (stars) => {
    try {
      console.log('Submitting rating:', { developerId, stars });
      setRatingState((prev) => ({ ...prev, loading: true }));

      const response = await ratingService.rateDeveloper(developerId, {
        stars,
        comment: '', // Optional: Add comment support later if needed
      });

      console.log('Rating submission response:', response);

      setRatingState((prev) => ({
        ...prev,
        averageRating: response.average_rating,
        totalRatings: response.total_ratings,
        userRating: stars,
        loading: false,
      }));

      toast.success(response.message || 'Rating submitted successfully');
    } catch (error) {
      console.error('Error submitting rating - Full error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      setRatingState((prev) => ({ ...prev, loading: false }));
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        'Failed to submit rating';
      toast.error(errorMessage);
    }
  };

  if (!developerId) {
    console.log('Rendering: Developer ID is required error');
    return <div className={styles.error}>Developer ID is required</div>;
  }

  if (ratingState.loading) {
    console.log('Rendering: Loading state');
    return <div className={styles.loading}>Loading ratings...</div>;
  }

  if (ratingState.error) {
    console.log('Rendering: Error state:', ratingState.error);
    return <div className={styles.error}>{ratingState.error}</div>;
  }

  console.log('Rendering: Rating display with state:', ratingState);

  return (
    <div className={styles.container}>
      {ratingState.totalRatings > 0 ? (
        <div className={styles.ratingInfo}>
          <StarRating
            rating={ratingState.averageRating}
            totalRatings={ratingState.totalRatings}
            interactive={true}
            onRate={handleRate}
            userRating={ratingState.userRating}
          />
          <div className={styles.ratingDetails}>
            <p className={styles.totalRatings}>
              Total: {ratingState.totalRatings}{' '}
              {ratingState.totalRatings === 1 ? 'rating' : 'ratings'}
            </p>
            <p className={styles.ratingNote}>Stars represent an average</p>
            <p className={styles.ratingNote}>
              Your vote increases or decreases
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.noRatings}>
          <p>No ratings yet</p>
          <p className={styles.ratePrompt}>
            Be the first to rate this developer!
          </p>
        </div>
      )}
    </div>
  );
};

export default DeveloperRatingSection;
