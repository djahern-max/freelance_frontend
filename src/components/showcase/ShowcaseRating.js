import React, { useState, useEffect } from 'react';
import { Star, Video, User } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ShowcaseRating.module.css';

const ShowcaseRating = ({ showcaseId, initialRating = 0 }) => {
    const navigate = useNavigate();
    const [userRating, setUserRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(false);
    const [linkedContent, setLinkedContent] = useState([]);

    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
    const currentUser = useSelector((state) => state.auth.user);

    useEffect(() => {
        fetchRatings();
        fetchShowcaseDetails();
        if (isAuthenticated) {
            // fetchUserRating();
        }
    }, [showcaseId, isAuthenticated]);

    const fetchShowcaseDetails = async () => {
        try {
            const response = await api.get(`/project-showcase/${showcaseId}`);
            if (response.data.linked_content) {
                setLinkedContent(response.data.linked_content);
            }
        } catch (error) {
            console.error('Error fetching showcase details:', error);
        }
    };

    // const fetchUserRating = async () => {
    //     try {
    //         const response = await api.get(`/project-showcase/${showcaseId}/user-rating`);
    //         setUserRating(response.data.stars);
    //     } catch (error) {
    //         if (error.response?.status !== 404) {
    //             console.error('Error fetching user rating:', error);
    //         }
    //     }
    // };

    const fetchRatings = async () => {
        try {
            const response = await api.get(`/project-showcase/${showcaseId}/ratings`);
            setAverageRating(response.data.average_rating);
            setTotalRatings(response.data.total_ratings);
        } catch (error) {
            console.error('Error fetching ratings:', error);
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
        <div className={styles.container}>
            <div className={styles.ratingContainer}>
                {/* Existing rating sections */}
                <div className={styles.ratingSection}>
                    <span className={styles.ratingLabel}>Your Rating:</span>
                    {/* ... existing star rating buttons ... */}
                </div>

                <div className={styles.ratingSection}>
                    <span className={styles.ratingLabel}>Average Rating:</span>
                    {/* ... existing average rating stars ... */}
                </div>
            </div>

            {/* Add linked content section */}
            {linkedContent.length > 0 && (
                <div className={styles.linkedContentSection}>
                    <h3 className={styles.sectionTitle}>Linked Content</h3>
                    <div className={styles.contentGrid}>
                        {linkedContent.map((content) => (
                            <div
                                key={content.id}
                                className={styles.contentCard}
                                onClick={() => {
                                    if (content.type === 'video') {
                                        navigate(`/video_display/stream/${content.content_id}`);
                                    } else if (content.type === 'profile') {
                                        navigate(`/profile/developers/${content.content_id}/public`);
                                    }
                                }}
                            >
                                {content.type === 'video' ? (
                                    <div className={styles.contentItem}>
                                        <div className={styles.thumbnailContainer}>
                                            {content.thumbnail_url ? (
                                                <img
                                                    src={content.thumbnail_url}
                                                    alt={content.title}
                                                    className={styles.thumbnail}
                                                />
                                            ) : (
                                                <Video size={24} />
                                            )}
                                        </div>
                                        <p className={styles.contentTitle}>{content.title}</p>
                                    </div>
                                ) : (
                                    <div className={styles.contentItem}>
                                        <div className={styles.profileContainer}>
                                            {content.profile_image_url ? (
                                                <img
                                                    src={content.profile_image_url}
                                                    alt="Developer profile"
                                                    className={styles.profileImage}
                                                />
                                            ) : (
                                                <User size={24} />
                                            )}
                                        </div>
                                        <p className={styles.contentTitle}>{content.developer_name}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowcaseRating;