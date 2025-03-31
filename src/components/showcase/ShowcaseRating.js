// src/components/showcase/ShowcaseRating.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { rateShowcase } from '../../redux/showcaseSlice';
import styles from './ShowcaseRating.module.css';

const ShowcaseRating = ({ showcaseId, averageRating, totalRatings, readOnly = false }) => {
    const dispatch = useDispatch();
    const [hoveredStar, setHoveredStar] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (success) {
            // Auto-hide success message after 3 seconds
            const timer = setTimeout(() => {
                setSuccess(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleRating = async (stars) => {
        if (readOnly) return;

        try {
            setError(null);
            setIsAnimating(true);

            const result = await dispatch(rateShowcase({ id: showcaseId, stars })).unwrap();

            if (result.success) {
                setUserRating(stars);
                setSuccess(true);
                // Trigger stars animation
                setTimeout(() => {
                    setIsAnimating(false);
                }, 600);
            }
        } catch (error) {
            setError(error.message || 'Cannot rate your own showcase');
            setIsAnimating(false);
            console.error('Error rating showcase:', error);
        }
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => {
            const filled = hoveredStar ? star <= hoveredStar : star <= (userRating || averageRating);
            return (
                <button
                    key={star}
                    className={`${styles.star} ${filled ? styles.filled : ''} ${isAnimating && filled ? styles.animate : ''}`}
                    onMouseEnter={() => !readOnly && setHoveredStar(star)}
                    onMouseLeave={() => !readOnly && setHoveredStar(null)}
                    onClick={() => handleRating(star)}
                    disabled={readOnly}
                    type="button"
                    aria-label={`Rate ${star} stars`}
                    style={{ cursor: readOnly ? 'default' : 'pointer' }}
                >
                    ★
                </button>
            );
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.starsContainer}>{renderStars()}</div>
            <div className={styles.stats}>
                <span className={styles.average}>
                    {averageRating ? averageRating.toFixed(1) : 'No'} / 5
                </span>
                <span className={styles.total}>
                    ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
            </div>
            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>Rating submitted successfully!</div>}
        </div>
    );
};

export default ShowcaseRating;