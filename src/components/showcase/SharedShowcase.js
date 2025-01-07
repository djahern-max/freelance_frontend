import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Star, ExternalLink, Code, Play } from 'lucide-react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import styles from './SharedShowcase.module.css';
import CreateRequestModal from '../requests/CreateRequestModal';
import AuthDialog from '../auth/AuthDialog';
import DeveloperRatingSection from '../profiles/DeveloperRatingSection';

const SharedShowcase = () => {
    const [showcase, setShowcase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [showAuthDialog, setShowAuthDialog] = useState(false);
    const [readmeContent, setReadmeContent] = useState(null);
    const { showcaseId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const response = await api.get(`/project-showcase/${showcaseId}`);
                setShowcase(response.data);

                // If there's a readme_url, fetch the content
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

    const handleBack = () => {
        window.history.back();
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

    if (!showcase) return null;

    return (
        <div className={styles.container}>
            <div className={styles.showcaseCard}>
                <div className={styles.header}>
                    <button onClick={handleBack} className={styles.backButton}>
                        <ArrowLeft size={16} />
                        Back
                    </button>
                    <h1 className={styles.title}>{showcase.title}</h1>
                </div>

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

                <div className={styles.rating}>
                    <DeveloperRatingSection developerId={showcase.developer_id} />
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

                <div className={styles.description}>
                    <h2>About This Project</h2>
                    <p>{showcase.description}</p>
                </div>

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
                            Watch Demo
                        </a>
                    )}
                </div>

                {readmeContent && (
                    <div className={styles.readme}>
                        <h2>README</h2>
                        <div className={styles.readmeContent}>
                            {readmeContent}
                        </div>
                    </div>
                )}

                {showcase.videos?.length > 0 && (
                    <div className={styles.videos}>
                        <h2>Project Videos</h2>
                        <div className={styles.videoGrid}>
                            {showcase.videos.map((video) => (
                                <div key={video.id} className={styles.videoCard}>
                                    <img
                                        src={video.thumbnail_path}
                                        alt={video.title}
                                        className={styles.videoThumbnail}
                                    />
                                    <h3>{video.title}</h3>
                                </div>
                            ))}
                        </div>
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