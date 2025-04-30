import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { getFullAssetUrl } from '../../utils/videoUtils';
import ReadmeModal from './ReadmeModal'; // Import the existing ReadmeModal component
import ReactDOM from 'react-dom'; // Add this import for the portal

import styles from './SharedShowcase.module.css';

const SharedShowcase = () => {
    const { id } = useParams();
    const [showcase, setShowcase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showVideos, setShowVideos] = useState(false);
    const [selectedDescription, setSelectedDescription] = useState(null); // For the modal approach
    const [showReadmeModal, setShowReadmeModal] = useState(false);

    // Character limit for truncated description
    const DESCRIPTION_CHAR_LIMIT = 150; // Matches ShowcaseList's 100 chars better for this layout

    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                if (!id || isNaN(parseInt(id))) {
                    throw new Error('Invalid showcase ID');
                }

                const response = await fetch(`/api/project-showcase/${id}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Error ${response.status}: ${errorText}`);
                    throw new Error(`Failed to load showcase (${response.status})`);
                }

                const data = await response.json();
                setShowcase(data);
            } catch (err) {
                console.error("Showcase fetch error:", err);
                setError('Failed to load showcase. The link may be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchShowcase();
    }, [id]);

    const getTruncatedDescription = (description) => {
        if (!description) return '';

        if (description.length > DESCRIPTION_CHAR_LIMIT) {
            return `${description.substring(0, DESCRIPTION_CHAR_LIMIT)}... `;
        }

        return description;
    };

    const closeModal = () => {
        setSelectedDescription(null);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <div className={styles.loadingText}>Loading showcase...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <div className={styles.errorMessage}>{error}</div>
                <Link to="/" className={styles.backButton}>Back to Showcases</Link>
            </div>
        );
    }

    if (!showcase) return null;

    return (
        <div className={styles.showcaseContainer}>
            <div className={styles.showcaseHeader}>
                <h1 className={styles.showcaseTitle}>{showcase.title}</h1>

                {showcase.developer && (
                    <div className={styles.developerInfo}>
                        <span>Created by:</span>
                        <Link
                            to={`/profile/developers/${showcase.developer_id}/public`}
                            className={styles.developerLink}
                        >
                            {showcase.developer.username}
                            {showcase.developer_profile?.profile_image_url && (
                                <img
                                    src={showcase.developer_profile.profile_image_url}
                                    alt={showcase.developer.username}
                                    className={styles.developerImage}
                                />
                            )}
                        </Link>
                    </div>
                )}
            </div>

            <div className={styles.showcaseContent}>
                <div className={styles.mainContent}>
                    {showcase.image_url && (
                        <div className={styles.imageContainer}>
                            <img
                                src={showcase.image_url}
                                alt={showcase.title}
                                className={styles.showcaseImage}
                            />
                        </div>
                    )}

                    <div className={styles.description}>
                        <h2 className={styles.sectionTitle}>Description</h2>
                        <div className={styles.descriptionWrapper}>
                            <p className={styles.descriptionText}>
                                {showcase.description ? (
                                    <>
                                        {getTruncatedDescription(showcase.description)}
                                        {showcase.description.length > DESCRIPTION_CHAR_LIMIT && (
                                            <button
                                                onClick={() => setSelectedDescription(showcase.description)}
                                                className={styles.readMoreButton}
                                            >
                                                Read More
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <span className={styles.placeholderText}>No description available</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {showcase.readme_url && (
                        <div className={styles.readmeSection}>
                            <button
                                className={styles.readmeButton}
                                onClick={() => setShowReadmeModal(true)}
                            >
                                <span>View README</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className={styles.sidebar}>
                    <div className={styles.projectLinks}>
                        <h3 className={styles.sidebarTitle}>Project Links</h3>


                        {showcase.project_url && (
                            <a
                                href={showcase.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.projectLink}
                            >
                                <ExternalLink className={styles.linkIcon} />
                                <span>Live Project</span>
                            </a>
                        )}

                        {showcase.repository_url && (
                            <a
                                href={showcase.repository_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.projectLink}
                            >
                                <ExternalLink className={styles.linkIcon} />
                                <span>Repository</span>
                            </a>
                        )}

                        {showcase.demo_url && (
                            <a
                                href={showcase.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.projectLink}
                            >
                                <ExternalLink className={styles.linkIcon} />
                                <span>View Demo</span>
                            </a>
                        )}




                    </div>

                    {
                        showcase.videos?.length > 0 && (
                            <div className={styles.videosSection}>
                                <h3
                                    className={styles.videoToggle}
                                    onClick={() => setShowVideos(!showVideos)}
                                >
                                    Related Videos ({showcase.videos.length})
                                    {showVideos ? (
                                        <ChevronUp className={styles.toggleIcon} />
                                    ) : (
                                        <ChevronDown className={styles.toggleIcon} />
                                    )}
                                </h3>

                                {showVideos && (
                                    <div className={styles.videoGrid}>
                                        {showcase.videos.map(video => (
                                            <Link
                                                key={video.id}
                                                to={`/video_display/stream/${video.id}`}
                                                className={styles.videoItem}
                                            >
                                                <div className={styles.videoThumbnailWrapper}>
                                                    <img
                                                        src={getFullAssetUrl(video.thumbnail_path)}
                                                        alt={video.title}
                                                        className={styles.videoThumbnail}
                                                    />
                                                    <div className={styles.videoTitle}>{video.title}</div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    }

                    {
                        showcase.average_rating !== undefined && (
                            <div className={styles.ratingSection}>
                                <h3 className={styles.sidebarTitle}>Rating</h3>
                                <div className={styles.ratingDisplay}>
                                    <div className={styles.starRating}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <span
                                                key={star}
                                                className={star <= Math.round(showcase.average_rating)
                                                    ? styles.starFilled
                                                    : styles.starEmpty}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <div className={styles.ratingText}>
                                        {showcase.average_rating ? showcase.average_rating.toFixed(1) : 'No rating'}
                                        {showcase.total_ratings ? ` (${showcase.total_ratings} ${showcase.total_ratings === 1 ? 'review' : 'reviews'})` : ''}
                                    </div>
                                </div>
                            </div>
                        )
                    }
                </div >
            </div >

            {/* Modal for Full Description */}
            {
                selectedDescription &&
                ReactDOM.createPortal(
                    <div className={styles.modalOverlay} onClick={closeModal}>
                        <div
                            className={styles.modalContent}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className={styles.modalTitle}>Full Description</h3>
                            <p className={styles.modalDescription}>{selectedDescription}</p>
                            <button
                                onClick={closeModal}
                                className={styles.closeButton}
                            >
                                Close
                            </button>
                        </div>
                    </div>,
                    document.body // Mount modal directly to the body
                )
            }

            {/* Use the existing ReadmeModal component */}
            {
                showReadmeModal && showcase && (
                    <ReadmeModal
                        showcase={showcase}
                        onClose={() => setShowReadmeModal(false)}
                    />
                )
            }
        </div >
    );
};

export default SharedShowcase;