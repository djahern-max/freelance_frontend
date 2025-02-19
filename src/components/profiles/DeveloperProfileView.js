// DeveloperProfileView.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './DeveloperProfileView.module.css';
import AuthDialog from '../auth/AuthDialog';
import CreateRequestModal from '../requests/CreateRequestModal';

const DeveloperProfileView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

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

    const handleRequestSent = (creatorUsername) => {
        toast.success(
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    Request Sent Successfully
                </span>
                <span>
                    Your request has been shared with {creatorUsername}. They will be
                    notified and can review it shortly.
                </span>
            </div>,
            {
                position: 'top-center',
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            }
        );
        setSelectedCreator(null);
    };

    const truncateBio = (bio, maxLength = 150) => {
        if (!bio) return '';
        if (bio.length <= maxLength) return bio;
        return `${bio.substring(0, maxLength)}...`;
    };

    const handleSendRequest = () => {
        if (!isAuthenticated) {
            setShowAuthDialog(true);
            return;
        }

        if (user?.userType === 'developer') {
            toast.info('As a creator, you cannot send requests to other creators.');
            return;
        }

        setSelectedCreator({
            id: profile.user_id,
            username: profile.username || `Creator #${profile.user_id}`
        });
    };



    if (loading) return <div>Loading profile...</div>;
    if (error) return <div>{error}</div>;
    if (!profile) return <div>Profile not found</div>;

    return (
        <div className={styles.container}>
            <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                    {profile.profile_image_url && (
                        <img
                            src={profile.profile_image_url}
                            alt="Profile"
                            className={styles.profileImage}
                        />
                    )}
                    <h2 className={styles.username}>{profile.username}</h2>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>📅</span>
                        <span>{profile.experience_years} years experience</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statIcon}>🎯</span>
                        <span>{profile.total_projects || 0} projects completed</span>
                    </div>
                </div>

                <div className={styles.bioSection}>
                    {!isExpanded ? (
                        <>
                            {truncateBio(profile.bio)}
                            {profile.bio?.length > 150 && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className={styles.readMoreLink}
                                >
                                    Read more
                                </button>
                            )}
                        </>
                    ) : (
                        profile.bio
                    )}
                </div>

                <div className={styles.skillsSection}>
                    <h3 className={styles.skillsTitle}>Skills</h3>
                    <div className={styles.skillsList}>
                        {profile.skills?.split(',').map((skill, index) => (
                            <span key={index} className={styles.skillPill}>
                                {skill.trim()}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <AuthDialog
                isOpen={showAuthDialog}
                onClose={() => setShowAuthDialog(false)}
                onLogin={() => navigate('/login', { state: { from: location.pathname } })}
                onRegister={() => navigate('/register', { state: { from: location.pathname } })}
            />

            {selectedCreator && (
                <CreateRequestModal
                    creatorId={String(selectedCreator.id)}
                    creatorUsername={selectedCreator.username}
                    onClose={() => setSelectedCreator(null)}
                    onSubmit={async (formData) => {
                        try {
                            await api.post('/requests/', {
                                ...formData,
                                developer_id: selectedCreator.id,
                            });
                            handleRequestSent(selectedCreator.username);
                        } catch (error) {
                            toast.error('Failed to send request');
                            console.error('Request error:', error);
                        }
                    }}
                    onRequestSent={() => handleRequestSent(selectedCreator.username)}
                />
            )}
        </div>
    );
}

export default DeveloperProfileView;