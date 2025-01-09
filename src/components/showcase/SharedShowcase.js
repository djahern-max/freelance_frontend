import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './SharedShowcase.module.css';

const SharedShowcase = () => {
    const { shareToken } = useParams();
    const [showcase, setShowcase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const response = await fetch(`/project-showcase/${shareToken}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to load showcase');
                }

                const data = await response.json();
                setShowcase(data);
            } catch (err) {
                setError('Failed to load showcase. The link may be invalid or expired.');
            } finally {
                setLoading(false);
            }
        };

        fetchShowcase();
    }, [shareToken]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingText}>Loading showcase...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                {error}
            </div>
        );
    }

    if (!showcase) {
        return null;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{showcase.title}</h1>

            <div className={styles.content}>
                <p className={styles.description}>{showcase.description}</p>

                {showcase.project_url && (
                    <a
                        href={showcase.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.projectLink}
                    >
                        View Project
                    </a>
                )}
            </div>

            {showcase.image_url && (
                <img
                    src={showcase.image_url}
                    alt={showcase.title}
                    className={styles.showcaseImage}
                />
            )}

            {showcase.videos?.length > 0 && (
                <div className={styles.videosSection}>
                    <h2 className={styles.videosTitle}>Related Videos</h2>
                    <div className={styles.videoGrid}>
                        {showcase.videos.map(video => (
                            <div key={video.id} className={styles.videoContainer}>
                                <video
                                    src={video.file_path}
                                    controls
                                    poster={video.thumbnail_path}
                                    className={styles.video}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedShowcase;