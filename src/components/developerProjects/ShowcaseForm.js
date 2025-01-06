import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ImageUpload from '../profiles/ImageUpload';  // Changed from named to default import
import Alert from '../shared/Alert';
import styles from './ShowcaseForm.module.css';

const ShowcaseForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_url: '',
        repository_url: '',
        demo_url: '',
        video_ids: [],
        developer_profile_id: null
    });
    const [readmeFile, setReadmeFile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [availableVideos, setAvailableVideos] = useState([]);
    const navigate = useNavigate();
    const { showcaseId } = useParams();
    const currentUser = useSelector(state => state.auth.user);
    const developerProfile = useSelector(state => state.profile.developerProfile);

    const fetchShowcase = async () => {
        try {
            const response = await fetch(`/api/project-showcase/${showcaseId}`);
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

    useEffect(() => {
        if (showcaseId) {
            fetchShowcase();
        }
        fetchUserVideos();
        if (developerProfile) {
            setFormData(prev => ({
                ...prev,
                developer_profile_id: developerProfile.id
            }));
        }
    }, [showcaseId, developerProfile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVideoToggle = (videoId) => {
        setFormData(prev => ({
            ...prev,
            video_ids: prev.video_ids.includes(videoId)
                ? prev.video_ids.filter(id => id !== videoId)
                : [...prev.video_ids, videoId]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formPayload = new FormData();

            // Append files
            if (imageFile) {
                formPayload.append('image_file', imageFile);
            }
            if (readmeFile) {
                formPayload.append('readme_file', readmeFile);
            }

            // Append other form data
            Object.keys(formData).forEach(key => {
                if (key === 'video_ids') {
                    formPayload.append(key, JSON.stringify(formData[key]));
                } else {
                    formPayload.append(key, formData[key]);
                }
            });

            const url = showcaseId ? `/api/project-showcase/${showcaseId}` : '/api/project-showcase';
            const response = await fetch(url, {
                method: showcaseId ? 'PUT' : 'POST',
                body: formPayload
            });

            if (!response.ok) throw new Error('Failed to save showcase');
            navigate(`/developer/profile/${currentUser.id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>
                {showcaseId ? 'Edit Showcase' : 'Create New Showcase'}
            </h2>

            {error && <Alert type="error" message={error} />}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Project Image</label>
                    <ImageUpload
                        onImageSelect={file => setImageFile(file)}
                        previewUrl={formData.image_url}
                    />
                </div>

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
                    <label htmlFor="project_url">Project URL</label>
                    <input
                        type="url"
                        id="project_url"
                        name="project_url"
                        value={formData.project_url}
                        onChange={handleInputChange}
                        placeholder="https://..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="repository_url">Repository URL</label>
                    <input
                        type="url"
                        id="repository_url"
                        name="repository_url"
                        value={formData.repository_url}
                        onChange={handleInputChange}
                        placeholder="https://github.com/..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="demo_url">Demo URL</label>
                    <input
                        type="url"
                        id="demo_url"
                        name="demo_url"
                        value={formData.demo_url}
                        onChange={handleInputChange}
                        placeholder="https://..."
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>README File</label>
                    <input
                        type="file"
                        accept=".md"
                        onChange={e => setReadmeFile(e.target.files[0])}
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
                                        readOnly
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
                        disabled={loading}
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
