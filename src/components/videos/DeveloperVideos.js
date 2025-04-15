// src/components/videos/DeveloperVideos.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '../../utils/apiService';
import VideoList from './VideoList';
import styles from './DeveloperVideos.module.css';
import PlaylistList from './PlaylistList';

const DeveloperVideos = () => {
    const { developerId } = useParams();
    const [developer, setDeveloper] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDeveloperData = async () => {
            try {
                setLoading(true);
                // Fetch developer profile
                const profileResponse = await apiService.get(`/profile/developers/${developerId}/public`);
                setDeveloper(profileResponse.data);

                // Fetch developer's videos
                const videosResponse = await apiService.get(`/video_display/developer/${developerId}`);
                setVideos(videosResponse.data);

                setLoading(false);
            } catch (err) {
                setError('Failed to load developer data');
                setLoading(false);
                console.error(err);
            }
        };

        if (developerId) {
            fetchDeveloperData();
        }
    }, [developerId]);

    if (loading) {
        return <div className={styles.loading}>Loading developer profile...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!developer) {
        return <div className={styles.notFound}>Developer not found</div>;
    }

    return (
        <div className={styles.developerVideos}>
            <div className={styles.developerHeader}>
                <div className={styles.developerProfile}>
                    {developer.profile_image_url && (
                        <img
                            src={developer.profile_image_url}
                            alt={developer.user.username}
                            className={styles.profileImage}
                        />
                    )}
                    <div className={styles.developerInfo}>
                        <h1>{developer.user.username}</h1>
                        <p className={styles.skills}>{developer.skills}</p>
                        <p className={styles.bio}>{developer.bio}</p>
                    </div>
                </div>
            </div>

            <div className={styles.videosSection}>
                <h2>Videos by {developer.user.username}</h2>
                {videos && videos.length > 0 ? (
                    <VideoList videos={videos} />
                ) : (
                    <p className={styles.noVideos}>This developer hasn't uploaded any videos yet.</p>
                )}
            </div>

            <div className={styles.playlistsSection}>
                <h2>Playlists by {developer.user.username}</h2>
                <PlaylistList userId={developerId} />
            </div>
        </div>
    );
};

export default DeveloperVideos;