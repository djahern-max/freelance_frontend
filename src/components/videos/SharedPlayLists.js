// src/components/videos/SharedPlaylist.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { getFullAssetUrl } from '../../utils/videoUtils';
import styles from './SharedPlaylist.module.css';

const SharedPlaylist = () => {
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentVideo, setCurrentVideo] = useState(null);
    const { shareToken } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSharedPlaylist = async () => {
            try {
                console.log('Fetching shared playlist with token:', shareToken);
                const response = await api.playlists.getSharedPlaylist(shareToken);
                console.log('Shared playlist response:', response);

                // If we have videos, select the first one by default
                if (response && response.videos && response.videos.length > 0) {
                    setCurrentVideo(response.videos[0]);
                }

                setPlaylist(response);
            } catch (err) {
                console.error('Error fetching shared playlist:', err);
                setError('Playlist not found or no longer available');
                toast.error('Error loading playlist');
            } finally {
                setLoading(false);
            }
        };

        if (shareToken) {
            fetchSharedPlaylist();
        }
    }, [shareToken]);

    const handleBack = () => {
        navigate('/playlists');
    };

    const playVideo = (video) => {
        setCurrentVideo(video);

        // Scroll to the top on mobile when changing videos
        if (window.innerWidth < 768) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner} />
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

    if (!playlist) return null;

    return (
        <div className={styles.container}>
            <div className={styles.playlistCard}>
                <div className={styles.header}>
                    <button onClick={handleBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className={styles.title}>{playlist.name || 'Shared Playlist'}</h1>
                </div>

                {playlist.description && (
                    <div className={styles.description}>
                        <p>{playlist.description}</p>
                    </div>
                )}

                <div className={styles.content}>
                    {/* Video Player Section */}
                    {currentVideo && (
                        <div className={styles.videoPlayer}>
                            <h2 className={styles.videoTitle}>{currentVideo.title}</h2>
                            <div className={styles.videoWrapper}>
                                <video
                                    className={styles.video}
                                    controls
                                    src={getFullAssetUrl(currentVideo.file_path)}
                                    poster={getFullAssetUrl(currentVideo.thumbnail_path)}
                                    autoPlay={false}
                                    preload="metadata"
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                            {currentVideo.description && (
                                <p className={styles.videoDescription}>{currentVideo.description}</p>
                            )}
                        </div>
                    )}

                    {/* Video List Section */}
                    <div className={styles.videoList}>
                        <h3 className={styles.videoListTitle}>Videos in this Playlist</h3>
                        {playlist.videos && playlist.videos.length > 0 ? (
                            playlist.videos.map((video) => (
                                <div
                                    key={video.id}
                                    className={`${styles.videoItem} ${currentVideo && currentVideo.id === video.id ? styles.activeVideo : ''}`}
                                    onClick={() => playVideo(video)}
                                >
                                    <div
                                        className={styles.thumbnail}
                                        style={{
                                            backgroundImage: `url(${getFullAssetUrl(video.thumbnail_path) || '/default-thumbnail.jpg'})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    />
                                    <div className={styles.videoInfo}>
                                        <h3>{video.title}</h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className={styles.emptyMessage}>This playlist has no videos.</p>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default SharedPlaylist;