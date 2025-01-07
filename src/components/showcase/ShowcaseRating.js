import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ShowcaseRating.module.css';

const ShowcaseRating = ({ showcaseId, initialRating = 0 }) => {
    const [userRating, setUserRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(false);

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        fetchRatings();
        if (isAuthenticated) {
            fetchUserRating();
        }
    }, [showcaseId, isAuthenticated]);

    const fetchRatings = async () => {
        try {
            const response = await api.get(`/project-showcase/${showcaseId}/rating`);
            setAverageRating(response.data.average_rating);
            setTotalRatings(response.data.total_ratings);
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const fetchUserRating = async () => {
        try {
            const response = await api.get(`/project-showcase/${showcaseId}/user-rating`);
            setUserRating(response.data.stars);
        } catch (error) {
            if (error.response?.status !== 404) {
                console.error('Error fetching user rating:', error);
            }
        }
    };

    const handleRating = async (rating) => {
        if (!isAuthenticated) {
            toast.error('Please sign in to rate this showcase');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post(`/project-showcase/${showcaseId}/rating`, {
                stars: rating
            });

            setUserRating(rating);
            setAverageRating(response.data.average_rating);
            setTotalRatings(response.data.total_ratings);
            toast.success('Rating submitted successfully');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.ratingContainer}>
            {/* User rating section */}
            <div className={styles.ratingSection}>
                <span className={styles.ratingLabel}>Your Rating:</span>
                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            className={styles.starButton}
                            disabled={loading}
                            onClick={() => handleRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                        >
                            <Star
                                size={24}
                                className={`${styles.star} ${(hoveredRating ? star <= hoveredRating : star <= userRating)
                                        ? styles.starActive
                                        : ''
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Average rating section */}
            <div className={styles.ratingSection}>
                <span className={styles.ratingLabel}>Average Rating:</span>
                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            size={24}
                            className={`${styles.star} ${star <= Math.round(averageRating) ? styles.starActive : ''
                                }`}
                        />
                    ))}
                    <span className={styles.ratingCount}>
                        ({averageRating.toFixed(1)} / {totalRatings} ratings)
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseRating;