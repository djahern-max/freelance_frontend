// DeveloperRatingSection.js
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import styles from './DeveloperRatingSection.module.css';

const DeveloperRatingSection = ({ developerId }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get(`/developer-metrics/${developerId}`);
                setMetrics(response.data);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        };

        const fetchUserRating = async () => {
            if (isAuthenticated) {
                try {
                    const response = await api.get(`/developer-metrics/${developerId}/user-rating`);
                    setUserRating(response.data);
                    setRating(response.data.stars);
                } catch (error) {
                    if (error.response?.status !== 404) {
                        console.error('Error fetching user rating:', error);
                    }
                }
            }
        };

        fetchMetrics();
        fetchUserRating();
    }, [developerId, isAuthenticated]);

    const handleRatingClick = async (selectedRating) => {
        if (!isAuthenticated) {
            setShowAuthDialog(true);
            return;
        }

        if (currentUser?.id === developerId) {
            toast.error('You cannot rate your own profile');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await api.post(`/developer-metrics/${developerId}/rate`, {
                stars: selectedRating,
            });

            setUserRating(response.data);
            setRating(selectedRating);
            toast.success('Rating submitted successfully');
        } catch (error) {
            console.error('Rating error:', error);
            toast.error(error.response?.data?.detail || 'Failed to submit rating');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                    <button
                        key={starValue}
                        className={styles.starButton}
                        disabled={isSubmitting}
                        onClick={() => handleRatingClick(starValue)}
                        onMouseEnter={() => setHoveredRating(starValue)}
                        onMouseLeave={() => setHoveredRating(0)}
                    >
                        <Star
                            size={24}
                            className={`${styles.star} ${(hoveredRating ? starValue <= hoveredRating : starValue <= rating)
                                    ? styles.starFilled
                                    : styles.starEmpty
                                }`}
                        />
                    </button>
                ))}
            </div>

            {metrics && (
                <div className={styles.metrics}>
                    <span>{metrics.profile_rating.toFixed(1)} out of 5</span>
                    <span className={styles.dot}>•</span>
                    <span>{metrics.total_ratings} ratings</span>
                </div>
            )}

            <AuthDialog
                isOpen={showAuthDialog}
                onClose={() => setShowAuthDialog(false)}
            />
        </div>
    );
};

export default DeveloperRatingSection;