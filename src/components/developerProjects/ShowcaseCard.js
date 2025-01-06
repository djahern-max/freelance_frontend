import React, { useState, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import styles from './ShowcaseCard.module.css';
import { useSelector } from 'react-redux';
import ReadmePage from './ReadmePage';
import StarRating from '../shared/StarRating';
import CreateRequestModal from '../requests/CreateRequestModal';


const ShowcaseCard = ({ showcase, isOwner }) => {
    const [expanded, setExpanded] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(false);
    const [showReadme, setShowReadme] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                // Use the api.showcase methods
                const ratingData = await api.showcase.getRating(showcase.id);
                setAverageRating(ratingData.average_rating || 0);
                setTotalRatings(ratingData.total_ratings || 0);

                if (isAuthenticated) {
                    const userRatingData = await api.showcase.getUserRating(showcase.id);
                    if (userRatingData) {
                        setUserRating(userRatingData.stars);
                    }
                }
            } catch (error) {
                console.error('Error fetching ratings:', error);
            }
        };

        fetchRatings();
    }, [showcase.id, isAuthenticated]);

    const handleRating = async (rating) => {
        if (!isAuthenticated) {
            toast.error('Please login to rate this project');
            return;
        }

        if (isOwner) {
            toast.error('You cannot rate your own project');
            return;
        }

        try {
            setLoading(true);
            // Use the correct endpoint for rating submission
            const response = await api.showcase.submitRating(showcase.id, rating);

            if (response.data) {
                setUserRating(rating);
                setAverageRating(response.data.average_rating);
                setTotalRatings(response.data.total_ratings);
                toast.success('Rating submitted successfully!');
            }
        } catch (error) {
            console.error('Error submitting rating:', error);
            toast.error('Failed to submit rating');
        } finally {
            setLoading(false);
        }
    };

    const handleContactDeveloper = () => {
        if (!isAuthenticated) {
            toast.error('Please login to contact the developer');
            return;
        }

        if (user?.userType === 'developer') {
            toast.info('As a developer, you cannot send requests to other developers.');
            return;
        }

        setShowRequestModal(true);
    };

    const handleRequestSent = () => {
        toast.success(
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    Request Sent Successfully
                </span>
                <span>
                    Your request has been shared with the developer. They will be notified shortly.
                </span>
            </div>
        );
        setShowRequestModal(false);
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
                    <StarRating
                        value={userRating}
                        onChange={handleRating}
                        disabled={loading || isOwner}
                    />
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

            {showRequestModal && (
                <CreateRequestModal
                    creatorId={String(showcase.developer_id)}
                    onClose={() => setShowRequestModal(false)}
                    onSubmit={async (formData) => {
                        try {
                            await api.post('/requests/', {
                                ...formData,
                                developer_id: showcase.developer_id,
                                showcase_id: showcase.id
                            });
                            handleRequestSent();
                        } catch (error) {
                            console.error('Request error:', error);
                            toast.error('Failed to send request');
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ShowcaseCard;