import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import styles from './DeveloperProfileView.module.css';

const DeveloperProfileView = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get(`/profile/developers/${id}/public`);
                setProfile(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching developer profile:', err);
                setError('Failed to load developer profile');
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>{error}</div>;
    if (!profile) return <div>Profile not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                {profile.profile_image_url && (
                    <img
                        src={profile.profile_image_url}
                        alt="Profile"
                        className={styles.profileImage}
                    />
                )}
                <h1 className={styles.name}>{profile.username}</h1>
                <div className={styles.info}>
                    <div className={styles.infoItem}>
                        <strong>Skills:</strong> {profile.skills}
                    </div>
                    <div className={styles.infoItem}>
                        <strong>Experience:</strong> {profile.experience_years} years
                    </div>
                    <div className={styles.bio}>
                        {profile.bio}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperProfileView;