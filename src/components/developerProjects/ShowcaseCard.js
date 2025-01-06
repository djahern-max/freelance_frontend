import React, { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import styles from './ShowcaseCard.module.css';
import { useSelector } from 'react-redux';
import ReadmePage from './ReadmePage';

const ShowcaseCard = ({ showcase, isOwner }) => {
    const [expanded, setExpanded] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showReadme, setShowReadme] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const handleRating = async (rating) => {
        if (!isAuthenticated) {
            toast.error('Please login to rate this project');
            return;
        }

        try {
            setLoading(true);
            // TODO: Implement rating endpoint in backend
            toast.info('Rating feature coming soon!');
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    const handleContactDeveloper = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to contact the developer');
            return;
        }

        try {
            await api.conversations.create({
                developer_id: showcase.developer_id,
                message: `I'm interested in your project "${showcase.title}"`,
                includeShowcase: true,
                showcaseId: showcase.id
            });
            toast.success('Message sent to developer!');
        } catch (error) {
            console.error('Error contacting developer:', error);
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
                                className={`${styles.star} ${star <= userRating ? styles.starFilled : styles.starEmpty}`}
                                onClick={() => !loading && handleRating(star)}
                            />
                        ))}
                    </div>
                    <span className={styles.ratingInfo}>
                        ({averageRating.toFixed(1)} • {totalRatings} ratings)
                    </span>
                </div>

                {showcase.readme_url && (
                    <div className={styles.readmeSection}>
                        <button
                            onClick={() => setShowReadme(true)}
                            className={styles.readmeButton}
                        >
                            View README
                        </button>
                    </div>
                )}

                {showReadme && (
                    <ReadmePage
                        showcase={showcase}
                        onClose={() => setShowReadme(false)}
                    />
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

                {!isOwner && user?.userType === 'client' && (
                    <button
                        onClick={handleContactDeveloper}
                        className={styles.contactButton}
                        disabled={loading}
                    >
                        <MessageSquare size={16} className={styles.icon} />
                        Send Request
                    </button>
                )}
            </div>
        </div>
    );
};

export default ShowcaseCard;