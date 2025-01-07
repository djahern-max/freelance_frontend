// SharedShowcase.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Star, ExternalLink, Code, Play, Share2, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import styles from './SharedShowcase.module.css';
import CreateRequestModal from '../requests/CreateRequestModal';
import AuthDialog from '../auth/AuthDialog';

const SharedShowcase = () => {
    const [showcase, setShowcase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [readmeContent, setReadmeContent] = useState(null);
    const [copied, setCopied] = useState(false);

    const { showcaseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const response = await api.get(`/project-showcase/${showcaseId}`);
                console.log('Showcase raw data:', response.data);
                console.log('Linked content:', response.data.linked_content);
                if (response.data.linked_content) {
                    console.log('Videos:', response.data.linked_content.filter(content => content.type === 'video'));
                    console.log('Has profile:', response.data.linked_content.some(content => content.type === 'profile'));
                }

                const showcaseData = {
                    ...response.data,
                    linked_content: response.data.linked_content || []
                };

                setShowcase(showcaseData);

                if (response.data.readme_url) {
                    const readmeResponse = await api.get(`/project-showcase/${showcaseId}/readme`);
                    setReadmeContent(readmeResponse.data.content);
                }
            } catch (err) {
                console.error('Error fetching showcase:', err);
                setError('Project not found or no longer available');
                toast.error('Error loading project');
            } finally {
                setLoading(false);
            }
        };

        if (showcaseId) {
            fetchShowcase();
        }
    }, [showcaseId]);
    const handleShare = async () => {
        try {
            const deployedUrl = process.env.REACT_APP_FRONTEND_URL || window.location.origin;
            const shareUrl = `${deployedUrl}/showcase/${showcaseId}`;

            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            toast.success('Link copied to clipboard!');
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error('Failed to copy link');
        }
    };

    const handleSendRequest = () => {
        if (!isAuthenticated) {
            setShowAuthDialog(true);
            return;
        }

        if (user?.userType === 'developer') {
            toast.info('As a developer, you cannot send requests to other developers.');
            return;
        }

        setSelectedCreator({
            id: showcase.developer_id,
            username: showcase.developer?.username || `Developer #${showcase.developer_id}`,
        });
    };

    const handleViewProfile = () => {
        if (showcase?.developer_profile?.id) {
            navigate(`/developers/${showcase.developer_profile.user_id}/public`);
        }
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loadingSpinner}>
                    <div className={styles.spinner}></div>
                    <p>Loading project...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button onClick={() => window.history.back()} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (!showcase) return null;

    return (
        <div className={styles.container}>
            <div className={styles.showcaseCard}>
                <header className={styles.header}>
                    <button onClick={() => window.history.back()} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className={styles.title}>{showcase.title}</h1>
                </header>

                <div className={styles.mainContent}>
                    <div className={styles.imageWrapper}>
                        {showcase.image_url ? (
                            <img
                                src={showcase.image_url}
                                alt={showcase.title}
                                className={styles.showcaseImage}
                            />
                        ) : (
                            <div className={styles.imagePlaceholder}>
                                <Code size={48} />
                            </div>
                        )}
                    </div>

                    <div className={styles.actionButtons}>
                        {user?.userType !== 'developer' && (
                            <button
                                className={styles.requestButton}
                                onClick={handleSendRequest}
                            >
                                <MessageSquare size={16} />
                                Contact Creator
                            </button>
                        )}
                        <button
                            className={styles.shareButton}
                            onClick={handleShare}
                        >
                            <Share2 size={16} />
                            {copied ? 'Copied!' : 'Share Project'}
                        </button>
                    </div>

                    {showcase?.linked_content?.filter(content => content.type === 'video')?.length > 0 && (
                        <section className={styles.videos}>
                            <h2>Project Videos</h2>
                            <div className={styles.videoGrid}>
                                {showcase.linked_content
                                    .filter(content => content.type === 'video')
                                    .map((video) => (
                                        <div
                                            key={video.content_id}
                                            className={styles.videoCard}
                                            onClick={() => navigate(`/video_display/stream/${video.content_id}`)}
                                        >
                                            <div className={styles.videoThumbnailWrapper}>
                                                {video.thumbnail_path ? (
                                                    <img
                                                        src={video.thumbnail_path}
                                                        alt={video.title}
                                                        className={styles.videoThumbnail}
                                                    />
                                                ) : (
                                                    <div className={styles.videoPlaceholder}>
                                                        <Play size={32} />
                                                    </div>
                                                )}
                                                <div className={styles.videoOverlay}>
                                                    <Play size={24} className={styles.playIcon} />
                                                </div>
                                            </div>
                                            <h3>{video.title}</h3>
                                            {video.description && <p>{video.description}</p>}
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                    {/* Profile Section - Only show if profile was included */}
                    {showcase?.linked_content?.some(content => content.type === 'profile') && (
                        <section className={styles.developerSection}>
                            <h2>Developer Info</h2>
                            <div className={styles.developerCard}>
                                {showcase.developer_profile?.profile_image_url && (
                                    <img
                                        src={showcase.developer_profile.profile_image_url}
                                        alt="Developer"
                                        className={styles.developerImage}
                                    />
                                )}
                                <div className={styles.developerInfo}>
                                    <h3>{showcase.developer?.username}</h3>
                                    <p>{showcase.developer_profile?.bio}</p>
                                    <div className={styles.developerStats}>
                                        {showcase.developer_profile?.experience_years && (
                                            <span>
                                                <strong>Experience:</strong>
                                                {showcase.developer_profile.experience_years} years
                                            </span>
                                        )}
                                        {showcase.developer_profile?.rating && (
                                            <span>
                                                <Star size={16} />
                                                {showcase.developer_profile.rating.toFixed(1)}
                                            </span>
                                        )}
                                        {showcase.developer_profile?.success_rate && (
                                            <span>
                                                <strong>Success:</strong>
                                                {showcase.developer_profile.success_rate}%
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        className={styles.profileButton}
                                        onClick={() => navigate(`/profile/developers/${showcase.developer_profile.user_id}/public`)}
                                    >
                                        <User size={16} />
                                        View Full Profile
                                    </button>
                                </div>
                            </div>
                        </section>
                    )}


                    <div className={styles.links}>
                        {showcase.project_url && (
                            <a
                                href={showcase.project_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                <ExternalLink size={16} />
                                View Live Project
                            </a>
                        )}
                        {showcase.repository_url && (
                            <a
                                href={showcase.repository_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                <Code size={16} />
                                View Repository
                            </a>
                        )}
                        {showcase.demo_url && (
                            <a
                                href={showcase.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.link}
                            >
                                <Play size={16} />
                                View Demo
                            </a>
                        )}
                    </div>

                    {readmeContent && (
                        <section className={styles.readme}>
                            <h2>README</h2>
                            <div
                                className={styles.readmeContent}
                                dangerouslySetInnerHTML={{ __html: readmeContent }}
                            />
                        </section>
                    )}
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
                    onClose={() => setSelectedCreator(null)}
                    onSubmit={async (formData) => {
                        try {
                            await api.post('/requests/', {
                                ...formData,
                                developer_id: selectedCreator.id,
                            });
                            toast.success('Request sent successfully!');
                            setSelectedCreator(null);
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

export default SharedShowcase;