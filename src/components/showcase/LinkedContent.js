// src/components/showcase/LinkedContent.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { linkVideos, linkProfile } from '../../redux/showcaseSlice';
import styles from './LinkedContent.module.css';

const LinkedContent = ({ showcase, onComplete }) => {
    const dispatch = useDispatch();
    const { error, loading } = useSelector(state => state.showcase);
    const userVideos = useSelector(state => state.videos?.userVideos || []);

    const [selectedVideos, setSelectedVideos] = useState(
        showcase.videos?.map(v => v.id) || []
    );

    const [includeProfile, setIncludeProfile] = useState(
        showcase.linked_content?.some(content => content.type === 'profile')
    );

    const handleVideoSelect = (videoId) => {
        setSelectedVideos(prev => {
            if (prev.includes(videoId)) {
                return prev.filter(id => id !== videoId);
            }
            return [...prev, videoId];
        });
    };

    const handleSaveVideos = async () => {
        try {
            await dispatch(linkVideos({ id: showcase.id, videoIds: selectedVideos })).unwrap();
        } catch (err) {
            console.error('Failed to link videos:', err);
        }
    };

    const handleToggleProfile = async () => {
        try {
            await dispatch(linkProfile(showcase.id)).unwrap();
            setIncludeProfile(!includeProfile);
        } catch (err) {
            console.error('Failed to toggle profile:', err);
        }
    };

    return (
        <div className={styles.container}>
            <section className={styles.section}>
                <h3>Developer Profile</h3>
                <div className={styles.profileToggle}>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={includeProfile}
                            onChange={handleToggleProfile}
                            disabled={loading}
                        />
                        <span className={styles.slider}></span>
                    </label>
                    <span>Include my developer profile in this showcase</span>
                </div>
            </section>

            <section className={styles.section}>
                <h3>Project Videos</h3>
                {userVideos.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>You haven't uploaded any videos yet.</p>
                        <button className={styles.uploadButton}>Upload a Video</button>
                    </div>
                ) : (
                    <>
                        <div className={styles.videoGrid}>
                            {userVideos.map(video => (
                                <div
                                    key={video.id}
                                    className={`${styles.videoCard} ${selectedVideos.includes(video.id) ? styles.selected : ''
                                        }`}
                                    onClick={() => handleVideoSelect(video.id)}
                                >
                                    <div className={styles.thumbnail}>
                                        <img
                                            src={video.thumbnail_path}
                                            alt={video.title}
                                            className={styles.thumbnailImage}
                                        />
                                        {selectedVideos.includes(video.id) && (
                                            <div className={styles.selectedOverlay}>
                                                <span className={styles.checkmark}>✓</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.videoInfo}>
                                        <h4>{video.title}</h4>
                                        <p>{video.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button
                            className={styles.saveButton}
                            onClick={handleSaveVideos}
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Selected Videos'}
                        </button>
                    </>
                )}
            </section>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
                <button
                    onClick={onComplete}
                    className={styles.completeButton}
                    disabled={loading}
                >
                    Complete Setup
                </button>
            </div>
        </div>
    );
};

export default LinkedContent;