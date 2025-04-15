// src/components/videos/PlaylistDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPlaylistDetails } from '../../redux/playlistSlice';
import { getFullAssetUrl } from '../../utils/videoUtils';
import styles from './PlaylistDetail.module.css';

const PlaylistDetail = () => {
    const { playlistId } = useParams();
    const dispatch = useDispatch();
    const { currentPlaylist, loading, error } = useSelector(state => state.playlists);
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);

    useEffect(() => {
        if (playlistId) {
            dispatch(fetchPlaylistDetails(parseInt(playlistId)));
        }
    }, [dispatch, playlistId]);

    useEffect(() => {
        // Reset active video index when playlist changes
        setActiveVideoIndex(0);
    }, [currentPlaylist?.id]);

    if (loading) {
        return <div className={styles.loading}>Loading playlist...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    if (!currentPlaylist) {
        return <div className={styles.error}>Playlist not found</div>;
    }

    // Create a new array before sorting to avoid the read-only error
    const sortedVideos = currentPlaylist.videos && currentPlaylist.videos.length > 0
        ? [...currentPlaylist.videos].sort((a, b) => (a.order || 0) - (b.order || 0))
        : [];

    const activeVideo = sortedVideos.length > 0 ? sortedVideos[activeVideoIndex] : null;

    // Generate full URLs for video and thumbnail paths
    const getVideoUrl = (video) => {
        return video && video.file_path ? getFullAssetUrl(video.file_path) : '';
    };

    const getThumbnailUrl = (video) => {
        return video && video.thumbnail_path ? getFullAssetUrl(video.thumbnail_path) : '';
    };

    const handleVideoEnd = () => {
        // Auto-play next video if available
        if (activeVideoIndex < sortedVideos.length - 1) {
            setActiveVideoIndex(activeVideoIndex + 1);
        }
    };

    return (
        <div className={styles.playlistDetail}>
            <div className={styles.header}>
                <h1>{currentPlaylist.name}</h1>
                <p className={styles.description}>{currentPlaylist.description || 'No description'}</p>
                <div className={styles.meta}>
                    <span>Created by: {currentPlaylist.creator?.username || 'Unknown'}</span>
                    <span>{sortedVideos.length} videos</span>
                </div>
            </div>

            <div className={styles.playerContainer}>
                {activeVideo ? (
                    <div className={styles.videoPlayer}>
                        <video
                            key={activeVideo.id} // Important to force re-render when changing videos
                            src={getVideoUrl(activeVideo)}
                            controls
                            poster={getThumbnailUrl(activeVideo)}
                            className={styles.videoElement}
                            onEnded={handleVideoEnd}
                            autoPlay
                        />
                        <h2 className={styles.videoTitle}>{activeVideo.title}</h2>
                        <p className={styles.videoDescription}>{activeVideo.description || 'No description'}</p>
                    </div>
                ) : (
                    <div className={styles.emptyPlayer}>
                        <p>This playlist has no videos</p>
                    </div>
                )}

                <div className={styles.playlist}>
                    <h3>Videos in this playlist</h3>
                    <div className={styles.videoList}>
                        {sortedVideos.length > 0 ? (
                            sortedVideos.map((video, index) => (
                                <div
                                    key={video.id}
                                    className={`${styles.videoItem} ${index === activeVideoIndex ? styles.active : ''}`}
                                    onClick={() => setActiveVideoIndex(index)}
                                >
                                    <div className={styles.thumbnail}>
                                        <img
                                            src={getThumbnailUrl(video)}
                                            alt={video.title}
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/120x68?text=No+Thumbnail';
                                            }}
                                        />
                                    </div>
                                    <div className={styles.videoInfo}>
                                        <h4>{video.title}</h4>
                                        <span>{video.user?.username || 'Unknown'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyList}>
                                <p>No videos in this playlist</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlaylistDetail;