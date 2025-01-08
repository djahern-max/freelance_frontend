// src/components/showcase/LinkedContent.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { linkProfile, linkVideos } from '../../redux/showcaseSlice';
import styles from './LinkedContent.module.css';

const LinkedContent = ({
    showcase,
    onComplete,
    videos = [],
    profileUrl,
    isLoading = false,
    error = null
}) => {
    const dispatch = useDispatch();
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [includeProfile, setIncludeProfile] = useState(false);

    // Initialize from existing showcase data if available
    useEffect(() => {
        if (showcase?.videos) {
            setSelectedVideos(showcase.videos.map(v => v.id));
        }
        if (showcase?.linked_content) {
            setIncludeProfile(showcase.linked_content.some(content => content.type === 'profile'));
        }
    }, [showcase]);

    const handleSave = async (e) => {
        e.preventDefault();

        if (!showcase?.id) return;

        try {
            // Update videos if any are selected
            if (selectedVideos.length > 0) {
                await dispatch(linkVideos({
                    id: showcase.id,
                    videoIds: selectedVideos
                })).unwrap();
            }

            // Update profile if changed
            if (includeProfile) {
                await dispatch(linkProfile(showcase.id)).unwrap();
            }

            // Complete the process
            onComplete();
        } catch (err) {
            console.error('Error saving linked content:', err);
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
                        {videos.length > 0 ? (
                            videos.map((video) => (
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
                                        disabled={isLoading}
                                        className={styles.checkbox}
                                    />
                                    <div className={styles.videoInfo}>
                                        {video.thumbnail_path && (
                                            <img
                                                src={video.thumbnail_path}
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
                            disabled={isLoading}
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
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save & Finish'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LinkedContent;