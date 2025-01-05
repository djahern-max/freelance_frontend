import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Play, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './SharedVideo.module.css';

const SharedVideo = () => {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { shareToken } = useParams();

    useEffect(() => {
        const fetchSharedVideo = async () => {
            try {
                const response = await api.get(`/videos/shared/${shareToken}`);
                setVideo(response.data);
            } catch (err) {
                console.error('Error fetching shared video:', err);
                setError('Video not found or no longer available');
                toast.error('Error loading video');
            } finally {
                setLoading(false);
            }
        };

        if (shareToken) {
            fetchSharedVideo();
        }
    }, [shareToken]);

    const handleBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={handleBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!video) return null;

    return (
        <div className={styles.container}>
            <div className={styles.videoCard}>
                <div className={styles.header}>
                    <button onClick={handleBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className={styles.title}>{video.title || 'Shared Video'}</h1>
                </div>

                <div className={styles.videoWrapper}>
                    <video
                        className={styles.video}
                        controls
                        autoPlay
                        src={video.file_path}
                        poster={video.thumbnail_path}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>

                {video.description && (
                    <div className={styles.description}>
                        <p>{video.description}</p>
                    </div>
                )}

                {video.project_url && (
                    <div className={styles.projectLink}>
                        <a
                            href={video.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            View Project Details
                        </a>
                    </div>
                )}

                <div className={styles.metadata}>
                    <span>Uploaded: {new Date(video.upload_date).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default SharedVideo;