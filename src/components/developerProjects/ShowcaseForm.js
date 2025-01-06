import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Alert from '../shared/Alert';
import styles from './ShowcaseForm.module.css';

const ShowcaseForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        readme: '',
        video_ids: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableVideos, setAvailableVideos] = useState([]);
    const navigate = useNavigate();
    const { showcaseId } = useParams();
    const currentUser = useSelector(state => state.auth.user);

    useEffect(() => {
        if (showcaseId) {
            fetchShowcase();
        }
        fetchUserVideos();
    }, [showcaseId]);

    const fetchShowcase = async () => {
        try {
            const response = await fetch(`/api/showcase/${showcaseId}`);
            if (!response.ok) throw new Error('Failed to fetch showcase');
            const data = await response.json();
            setFormData(data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchUserVideos = async () => {
        try {
            const response = await fetch(`/api/videos/user/${currentUser.id}`);
            if (!response.ok) throw new Error('Failed to fetch videos');
            const data = await response.json();
            setAvailableVideos(data);
        } catch (err) {
            console.error('Error fetching videos:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const url = showcaseId
                ? `/api/showcase/${showcaseId}`
                : '/api/showcase';

            const response = await fetch(url, {
                method: showcaseId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save showcase');
            navigate(`/developer/profile/${currentUser.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVideoToggle = (videoId) => {
        setFormData(prev => {
            const newVideoIds = prev.video_ids.includes(videoId)
                ? prev.video_ids.filter(id => id !== videoId)
                : [...prev.video_ids, videoId];
            return {
                ...prev,
                video_ids: newVideoIds
            };
        });
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {showcaseId ? 'Edit Showcase' : 'Create New Showcase'}
            </h2>

            {error && <Alert type="error" message={error} />}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        rows={4}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="readme">README</label>
                    <textarea
                        id="readme"
                        name="readme"
                        value={formData.readme}
                        onChange={handleInputChange}
                        rows={8}
                    />
                </div>

                {availableVideos.length > 0 && (
                    <div className={styles.formGroup}>
                        <label>Related Videos</label>
                        <div className={styles.videoGrid}>
                            {availableVideos.map(video => (
                                <div
                                    key={video.id}
                                    className={styles.videoItem}
                                    onClick={() => handleVideoToggle(video.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.video_ids.includes(video.id)}
                                        onChange={() => { }}
                                    />
                                    <span>{video.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.buttonGroup}>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : (showcaseId ? 'Update' : 'Create')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ShowcaseForm;
