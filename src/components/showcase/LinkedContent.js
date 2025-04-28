// src/components/showcase/LinkedContent.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { linkProfile, linkVideos } from '../../redux/showcaseSlice';
import api from '../../utils/api';
import styles from './LinkedContent.module.css';
import { getFullAssetUrl } from '../../utils/videoUtils';

const LinkedContent = ({ showcase, onComplete }) => {
    const dispatch = useDispatch();
    const [userVideos, setUserVideos] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [includeProfile, setIncludeProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [savingVideos, setSavingVideos] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);

    useEffect(() => {
        const fetchUserVideos = async () => {
            try {
                const response = await api.get('/video_display/my-videos');
                console.log('Videos response:', response.data);
                setUserVideos(response.data.user_videos || []);
            } catch (err) {
                console.error('Error fetching videos:', err);
                setError('Failed to load videos');
            } finally {
                setLoading(false);
            }
        };

        fetchUserVideos();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        if (!showcase?.id) return;

        try {
            if (selectedVideos.length > 0) {
                setSavingVideos(true);
                await dispatch(linkVideos({
                    id: showcase.id,
                    videoIds: selectedVideos
                }));
            }

            if (includeProfile) {
                setSavingProfile(true);
                await dispatch(linkProfile(showcase.id));
            }

            onComplete();
        } catch (err) {
            setError('Failed to save changes');
        } finally {
            setSavingVideos(false);
            setSavingProfile(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Add Content to Your Showcase</h2>

            <form onSubmit={handleSave} className={styles.form}>
                {/* Video Selection Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Solution Videos</h3>
                    <div className={styles.videoGrid}>
                        {loading ? (
                            <div>Loading your videos...</div>
                        ) : userVideos.length > 0 ? (
                            userVideos.map((video) => (
                                <label key={video.id} className={styles.videoCard}>
                                    <input
                                        type="checkbox"
                                        checked={selectedVideos.includes(video.id)}
                                        onChange={(e) => {
                                            setSelectedVideos(prev =>
                                                e.target.checked
                                                    ? [...prev, video.id]
                                                    : prev.filter(id => id !== video.id)
                                            );
                                        }}
                                        className={styles.checkbox}
                                    />
                                    <div className={styles.videoInfo}>
                                        {video.thumbnail_path && (
                                            <img
                                                src={getFullAssetUrl(video.thumbnail_path)}
                                                alt={video.title}
                                                className={styles.thumbnail}
                                            />
                                        )}
                                        <span className={styles.videoTitle}>{video.title}</span>
                                    </div>
                                </label>
                            ))
                        ) : (
                            <p className={styles.noVideos}>
                                No videos available. Upload some videos first to add them to your showcase.
                            </p>
                        )}
                    </div>
                </div>

                {/* Profile Link Section */}
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Developer Profile</h3>
                    <label className={styles.profileToggle}>
                        <input
                            type="checkbox"
                            checked={includeProfile}
                            onChange={(e) => setIncludeProfile(e.target.checked)}
                            className={styles.checkbox}
                        />
                        Include my developer profile
                    </label>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onComplete}
                        className={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || savingVideos || savingProfile}
                    >
                        {savingVideos ? 'Saving Videos...' :
                            savingProfile ? 'Saving Profile...' :
                                loading ? 'Saving...' : 'Save & Finish'}
                    </button>

                </div>
            </form>
        </div>
    );
};

export default LinkedContent;