import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import styles from './ShowcaseCard.module.css';

const ShowcaseCard = ({ showcase, isOwner }) => {
    const [expanded, setExpanded] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRatings();
    }, [showcase.id]);

    const fetchRatings = async () => {
        try {
            const response = await api.get(`/project-showcase/showcase/${showcase.id}/rating`);
            setAverageRating(response.data.average_rating);
            setTotalRatings(response.data.total_ratings);

            const userRatingResponse = await api.get(`/project-showcase/showcase/${showcase.id}/user-rating`);
            if (userRatingResponse.data) {
                setUserRating(userRatingResponse.data.rating);
            }
        } catch (error) {
            console.error('Error fetching ratings:', error);
        }
    };

    const handleRating = async (rating) => {
        try {
            setLoading(true);
            const response = await api.post(`/project-showcase/showcase/${showcase.id}`, {
                rating: rating
            });

            setUserRating(rating);
            setAverageRating(response.data.average_rating);
            setTotalRatings(response.data.total_ratings);
            toast.success('Rating submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit rating');
            console.error('Error submitting rating:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleContactDeveloper = async () => {
        try {
            await api.post(`/conversations/developer/${showcase.developer_id}`, {
                message: `I'm interested in your project "${showcase.title}"`,
                includeShowcase: true,
                showcaseId: showcase.id
            });
            toast.success('Message sent to developer!');
        } catch (error) {
            toast.error('Failed to contact developer');
        }
    };

    return (
        <div className={styles.card}>
            {showcase.image_url && (
                <div className={styles.imageContainer}>
                    <img src={showcase.image_url} alt={showcase.title} />
                </div>
            )}

            <div className={styles.content}>
                <h3 className={styles.title}>{showcase.title}</h3>

                <div className={styles.description}>
                    {expanded ? showcase.description : (
                        <>
                            {showcase.description.slice(0, 150)}
                            {showcase.description.length > 150 && '...'}
                        </>
                    )}
                    {showcase.description.length > 150 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className={styles.link}
                        >
                            {expanded ? 'Show less' : 'Read more'}
                        </button>
                    )}
                </div>

                <div className={styles.ratingContainer}>
                    <div className={styles.stars}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={20}
                                className={`${styles.star} ${star <= userRating ? styles.starFilled : styles.starEmpty
                                    }`}
                                onClick={() => !loading && handleRating(star)}
                            />
                        ))}
                    </div>
                    <span className={styles.ratingInfo}>
                        ({averageRating.toFixed(1)} • {totalRatings} ratings)
                    </span>
                </div>

                {showcase.readme_url && (
                    <a
                        href={showcase.readme_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        View README
                    </a>
                )}
            </div>

            <div className={styles.links}>
                {showcase.project_url && (
                    <a
                        href={showcase.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        View Project
                    </a>
                )}

                {showcase.repository_url && (
                    <a
                        href={showcase.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.link}
                    >
                        View Code
                    </a>
                )}

                {!isOwner && (
                    <button
                        onClick={handleContactDeveloper}
                        className={styles.contactButton}
                    >
                        <MessageSquare className={styles.icon} />
                        Contact Developer
                    </button>
                )}
            </div>
        </div>
    );
};

export default ShowcaseCard;