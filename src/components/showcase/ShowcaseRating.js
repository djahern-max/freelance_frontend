// src/components/showcase/ShowcaseRating.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { rateShowcase } from '../../redux/showcaseSlice';
import styles from './ShowcaseRating.module.css';

const ShowcaseRating = ({ showcaseId, averageRating, totalRatings }) => {
    const dispatch = useDispatch();
    const [hoveredStar, setHoveredStar] = useState(null);
    const [userRating, setUserRating] = useState(null);
    const [error, setError] = useState(null);

    const handleRating = async (stars) => {
        try {
            setError(null);
            const result = await dispatch(rateShowcase({ id: showcaseId, stars })).unwrap();
            if (result.success) {
                setUserRating(stars);
            }
        } catch (error) {
            setError(error.message || 'Cannot rate your own showcase');
            console.error('Error rating showcase:', error);
        }
    };

    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((star) => {
            const filled = hoveredStar ? star <= hoveredStar : star <= (userRating || averageRating);
            return (
                <button
                    key={star}
                    className={`${styles.star} ${filled ? styles.filled : ''}`}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    onClick={() => handleRating(star)}
                    type="button"
                    aria-label={`Rate ${star} stars`}
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
        </div>
    );
};

export default ShowcaseRating;