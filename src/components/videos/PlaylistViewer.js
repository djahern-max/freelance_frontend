// components/videos/ResponsivePlaylistViewer.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './ResponsivePlaylistViewer.module.css';

const ResponsivePlaylistViewer = ({ playlist, videos, currentVideoId }) => {
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        // Set the current video or default to the first one
        if (currentVideoId) {
            setActiveVideo(videos.find(v => v.id === currentVideoId) || videos[0]);
        } else if (videos.length > 0) {
            setActiveVideo(videos[0]);
        }
    }, [videos, currentVideoId]);

    if (!playlist || videos.length === 0) {
        return <div className={styles.loading}>Loading playlist...</div>;
    }

    return (
        <div className={styles.playlistContainer}>
            <div className={styles.mainContent}>
                <h1 className={styles.playlistTitle}>{playlist.name}</h1>

                {playlist.description && (
                    <p className={styles.playlistDescription}>{playlist.description}</p>
                )}

                {activeVideo && (
                    <div className={styles.videoPlayer}>
                        <div className={styles.videoWrapper}>
                            <video
                                controls
                                src={activeVideo.file_path}
                                poster={activeVideo.thumbnail_path}
                                className={styles.video}
                            />
                        </div>
                        <div className={styles.activeVideoInfo}>
                            <h2 className={styles.videoTitle}>{activeVideo.title}</h2>
                            {activeVideo.description && (
                                <p className={styles.videoDescription}>{activeVideo.description}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.playlistSidebar}>
                <h3 className={styles.playlistVideosTitle}>Videos in this Playlist</h3>
                <div className={styles.videosList}>
                    {videos.map((video) => (
                        <div
                            key={video.id}
                            className={`${styles.videoItem} ${activeVideo && activeVideo.id === video.id ? styles.activeVideo : ''}`}
                            onClick={() => setActiveVideo(video)}
                        >
                            <div className={styles.thumbnailContainer}>
                                <img
                                    src={video.thumbnail_path || '/default-thumbnail.png'}
                                    alt={video.title}
                                    className={styles.thumbnail}
                                />
                                <div className={styles.videoDuration}>
                                    {/* You can add video duration here if available */}
                                    2:21
                                </div>
                            </div>
                            <div className={styles.videoItemInfo}>
                                <h4 className={styles.videoItemTitle}>{video.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.playlistFooter}>
                <button className={styles.supportButton}>
                    <span className={styles.heartIcon}>♥</span> Support RYZE
                </button>
                <div className={styles.footerActions}>
                    <button className={styles.actionButton}>
                        Help us empower more creators
                    </button>
                    <button className={styles.actionButton}>
                        Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResponsivePlaylistViewer;