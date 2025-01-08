// src/components/showcase/SharedShowcase.js
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ShowcaseRating from './ShowcaseRating';
import ReadmeModal from './ReadmeModal';
import styles from './SharedShowcase.module.css';

const SharedShowcase = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showcase, setShowcase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showReadme, setShowReadme] = useState(false);

    useEffect(() => {
        // Prevent the component from trying to fetch with invalid IDs
        if (id === 'create' || id === 'edit') {
            navigate('/showcase');
            return;
        }

        const fetchShowcase = async () => {
            try {
                setLoading(true);
                const data = await api.showcase.getDetail(id);
                setShowcase(data);
            } catch (err) {
                console.error('Error fetching showcase:', err);
                setError(err.message || 'Failed to load showcase');
            } finally {
                setLoading(false);
            }
        };

        fetchShowcase();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Loading showcase...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Error Loading Showcase</h2>
                <p>{error}</p>
                <Link to="/showcase" className={styles.homeLink}>
                    Return to Showcases
                </Link>
            </div>
        );
    }

    if (!showcase) {
        return (
            <div className={styles.notFound}>
                <h2>Showcase Not Found</h2>
                <p>The showcase you're looking for doesn't exist or has been removed.</p>
                <Link to="/showcase" className={styles.homeLink}>
                    Return to Showcases
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>{showcase.title}</h1>
                {showcase.developer_profile && (
                    <div className={styles.developerInfo}>
                        {showcase.developer_profile.profile_image_url && (
                            <img
                                src={showcase.developer_profile.profile_image_url}
                                alt={showcase.developer.username}
                                className={styles.developerImage}
                            />
                        )}
                        <div className={styles.developerDetails}>
                            <span className={styles.developerName}>
                                {showcase.developer.username}
                            </span>
                            {showcase.developer_profile.bio && (
                                <span className={styles.developerBio}>
                                    {showcase.developer_profile.bio}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.content}>
                {showcase.image_url && (
                    <div className={styles.imageSection}>
                        <img
                            src={showcase.image_url}
                            alt={showcase.title}
                            className={styles.showcaseImage}
                        />
                    </div>
                )}

                <div className={styles.details}>
                    <p className={styles.description}>{showcase.description}</p>

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
                                View Repository
                            </a>
                        )}
                        {showcase.demo_url && (
                            <a
                                href={showcase.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                Live Demo
                            </a>
                        )}
                    </div>

                    <div className={styles.ratingSection}>
                        <h3>Project Rating</h3>
                        <ShowcaseRating
                            showcaseId={showcase.id}
                            averageRating={showcase.average_rating}
                            totalRatings={showcase.total_ratings}
                        />
                    </div>

                    {showcase.readme_url && (
                        <button
                            onClick={() => setShowReadme(true)}
                            className={styles.readmeButton}
                        >
                            View README
                        </button>
                    )}

                    {showcase.videos && showcase.videos.length > 0 && (
                        <div className={styles.videoSection}>
                            <h3>Project Videos</h3>
                            <div className={styles.videoGrid}>
                                {showcase.videos.map((video) => (
                                    <div key={video.id} className={styles.videoCard}>
                                        {video.thumbnail_path && (
                                            <img
                                                src={video.thumbnail_path}
                                                alt={video.title}
                                                className={styles.videoThumbnail}
                                            />
                                        )}
                                        <div className={styles.videoInfo}>
                                            <h4>{video.title}</h4>
                                            <p>{video.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showReadme && (
                <ReadmeModal
                    showcase={showcase}
                    onClose={() => setShowReadme(false)}
                />
            )}
        </div>
    );
};

export default SharedShowcase;