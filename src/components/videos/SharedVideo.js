import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import styles from './SharedVideo.module.css';
import CreateRequestModal from '../requests/CreateRequestModal';
import AuthDialog from '../auth/AuthDialog';

const SharedVideo = () => {
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const { shareToken } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        const fetchSharedVideo = async () => {
            try {
                const response = await api.videos.getSharedVideo(shareToken);
                setVideo(response);
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
            id: video.user_id,
            username: video.user?.full_name || video.user?.username || `Creator #${video.user_id}`,
            videoId: video.id,
        });
    };

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

                <div className={styles.actionButtons}>
                    {user?.userType !== 'developer' && (
                        <button
                            className={styles.requestButton}
                            onClick={handleSendRequest}
                        >
                            <MessageSquare size={16} className={styles.icon} />
                            <span>Send Me a Request</span>
                        </button>
                    )}
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
            </div>

            <AuthDialog
                isOpen={showAuthDialog}
                onClose={() => setShowAuthDialog(false)}
                onLogin={() => navigate('/login', { state: { from: location.pathname } })}
                onRegister={() => navigate('/register', { state: { from: location.pathname } })}
            />

            {selectedCreator && (
                <CreateRequestModal
                    onClose={() => setSelectedCreator(null)}
                    onSubmit={async (formData) => {
                        try {
                            await api.post('/requests/', {
                                ...formData,
                                developer_id: selectedCreator.id,
                                video_id: selectedCreator.videoId,
                            });
                            handleRequestSent(selectedCreator.username);
                        } catch (error) {
                            toast.error('Failed to send request');
                            console.error('Request error:', error);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default SharedVideo;