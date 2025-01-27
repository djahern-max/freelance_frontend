import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createShowcase, updateShowcase, updateShowcaseFiles } from '../../redux/showcaseSlice';
import LinkedContent from './LinkedContent';
import styles from './ShowcaseForm.module.css';
import api from '../../utils/api';

const ShowcaseForm = ({ isEditing = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, currentShowcase } = useSelector((state) => state.showcase);
    const [videos, setVideos] = useState([]);
    const [userVideos, setUserVideos] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [profile, setProfile] = useState(null);
    const [includeProfile, setIncludeProfile] = useState(false);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_url: '',
        repository_url: '',
        demo_url: '',
        image_file: null,
        readme_file: null
    });

    const [preview, setPreview] = useState({
        image: null,
        readme: null
    });

    const [showLinkedContent, setShowLinkedContent] = useState(false);
    const [createdShowcase, setCreatedShowcase] = useState(null);

    useEffect(() => {
        const fetchUserContent = async () => {
            try {
                const [videosResponse, profileResponse] = await Promise.all([
                    api.get('/video_display/my-videos'),
                    api.get('/profile/developer')
                ]);
                setUserVideos(videosResponse.data);
                setProfile(profileResponse.data);
            } catch (err) {
                console.error('Error fetching user content:', err);
                setApiError('Failed to load user content');
            }
        };
        fetchUserContent();
    }, []);

    useEffect(() => {
        if (currentShowcase && isEditing) {
            setFormData(prevData => ({
                ...prevData,
                title: currentShowcase.title || '',
                description: currentShowcase.description || '',
                project_url: currentShowcase.project_url || '',
                repository_url: currentShowcase.repository_url || '',
                demo_url: currentShowcase.demo_url || ''
            }));

            // Set selected videos if any
            if (currentShowcase.videos) {
                setSelectedVideos(currentShowcase.videos.map(v => v.id));
            }

            // Set profile inclusion if linked
            setIncludeProfile(!!currentShowcase.developer_profile_id);
        }
    }, [currentShowcase, isEditing]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isSubmitting) return;

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');
        setApiError(null);

        try {
            if (isEditing && currentShowcase?.id) {
                // First update basic information
                const updateData = {
                    title: formData.title,
                    description: formData.description,
                    project_url: formData.project_url || null,
                    repository_url: formData.repository_url || null,
                    demo_url: formData.demo_url || null
                };

                const response = await dispatch(updateShowcase({
                    id: currentShowcase.id,
                    data: updateData
                })).unwrap();

                // Update files if changed
                if (formData.image_file || formData.readme_file) {
                    const filesFormData = new FormData();
                    if (formData.image_file) {
                        filesFormData.append('image_file', formData.image_file);
                    }
                    if (formData.readme_file) {
                        filesFormData.append('readme_file', formData.readme_file);
                    }
                    await dispatch(updateShowcaseFiles({
                        id: currentShowcase.id,
                        data: filesFormData
                    })).unwrap();
                }

                // Update videos if changed
                if (selectedVideos.length > 0) {
                    await api.put(`/project-showcase/${currentShowcase.id}/videos`, {
                        video_ids: selectedVideos
                    });
                }

                // Update profile linking if changed
                if (includeProfile) {
                    await api.put(`/project-showcase/${currentShowcase.id}/profile`);
                }

                setSuccessMessage('Showcase updated successfully!');
                setTimeout(() => {
                    navigate('/showcase');
                }, 1500);

            } else {
                // Create new showcase logic remains the same
                const submitData = new FormData();
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                        submitData.append(key, formData[key]);
                    }
                });

                // Add video IDs and profile inclusion
                if (selectedVideos.length > 0) {
                    submitData.append('selected_video_ids', JSON.stringify(selectedVideos));
                }
                submitData.append('include_profile', includeProfile);

                const response = await dispatch(createShowcase(submitData)).unwrap();
                setSuccessMessage('Showcase created successfully!');
                setTimeout(() => {
                    setCreatedShowcase(response);
                    setShowLinkedContent(true);
                }, 1500);
            }
        } catch (err) {
            console.error('Error submitting showcase:', err);
            setApiError(err.message || 'Error submitting showcase');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVideoSelection = (videoId) => {
        setSelectedVideos(prev => {
            if (prev.includes(videoId)) {
                return prev.filter(id => id !== videoId);
            }
            return [...prev, videoId];
        });
    };

    const handleFinish = () => {
        navigate('/showcase');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [name]: files[0]
            }));

            if (name === 'image_file') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(prev => ({
                        ...prev,
                        image: reader.result
                    }));
                };
                reader.readAsDataURL(files[0]);
            } else if (name === 'readme_file') {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(prev => ({
                        ...prev,
                        readme: reader.result
                    }));
                };
                reader.readAsText(files[0]);
            }
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.title.trim()) {
            errors.title = 'Title is required';
        }
        if (!formData.description.trim()) {
            errors.description = 'Description is required';
        }

        // Validate URLs only if they're not empty
        const urlFields = ['project_url', 'repository_url', 'demo_url'];
        urlFields.forEach(field => {
            if (formData[field] && !isValidUrl(formData[field])) {
                errors[field] = 'Please enter a valid URL';
            }
        });

        if (!isEditing && !formData.image_file) {
            errors.image_file = 'Project image is required';
        }
        if (!isEditing && !formData.readme_file) {
            errors.readme_file = 'README file is required';
        }

        return errors;
    };

    const isValidUrl = (url) => {
        if (!url) return true; // Empty URLs are valid (for optional fields)
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };



    if (showLinkedContent && !loading) {
        return (
            <div className={styles.container}>
                <LinkedContent
                    showcase={createdShowcase}
                    videos={videos}
                    profileUrl={profile?.profile_url}
                    isLoading={apiLoading}
                    error={apiError}
                    onComplete={handleFinish}
                />
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <form className={styles.form} onSubmit={handleSubmit}>
                {successMessage && (
                    <div className={styles.successMessage}>
                        {successMessage}
                    </div>
                )}

                {apiError && (
                    <div className={styles.errorMessage}>
                        {apiError}
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="title">Title *</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className={`${styles.input} ${formErrors.title ? styles.inputError : ''}`}
                    />
                    {formErrors.title && <span className={styles.errorMessage}>{formErrors.title}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description *</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        className={`${styles.textarea} ${formErrors.description ? styles.inputError : ''}`}
                    />
                    {formErrors.description && <span className={styles.errorMessage}>{formErrors.description}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="project_url">Project URL *</label>
                    <input
                        type="url"
                        id="project_url"
                        name="project_url"
                        value={formData.project_url}
                        onChange={handleInputChange}
                        required
                        className={`${styles.input} ${formErrors.project_url ? styles.inputError : ''}`}
                        placeholder="https://"
                    />
                    {formErrors.project_url && <span className={styles.errorMessage}>{formErrors.project_url}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="repository_url">Repository URL</label>
                    <input
                        type="url"
                        id="repository_url"
                        name="repository_url"
                        value={formData.repository_url}
                        onChange={handleInputChange}
                        className={`${styles.input} ${formErrors.repository_url ? styles.inputError : ''}`}
                        placeholder="https://"
                    />
                    {formErrors.repository_url && <span className={styles.errorMessage}>{formErrors.repository_url}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="demo_url">Demo URL</label>
                    <input
                        type="url"
                        id="demo_url"
                        name="demo_url"
                        value={formData.demo_url}
                        onChange={handleInputChange}
                        className={`${styles.input} ${formErrors.demo_url ? styles.inputError : ''}`}
                        placeholder="https://"
                    />
                    {formErrors.demo_url && <span className={styles.errorMessage}>{formErrors.demo_url}</span>}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="image_file">Project Image {!isEditing && '*'}</label>
                    <input
                        type="file"
                        id="image_file"
                        name="image_file"
                        onChange={handleFileChange}
                        accept="image/*"
                        required={!isEditing}
                        className={`${styles.fileInput} ${formErrors.image_file ? styles.inputError : ''}`}
                    />
                    {formErrors.image_file && <span className={styles.errorMessage}>{formErrors.image_file}</span>}
                    {preview.image && (
                        <div className={styles.imagePreview}>
                            <img src={preview.image} alt="Preview" />
                        </div>
                    )}
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="readme_file">README File {!isEditing && '*'}</label>
                    <input
                        type="file"
                        id="readme_file"
                        name="readme_file"
                        onChange={handleFileChange}
                        accept=".md"
                        required={!isEditing}
                        className={`${styles.fileInput} ${formErrors.readme_file ? styles.inputError : ''}`}
                    />
                    {formErrors.readme_file && <span className={styles.errorMessage}>{formErrors.readme_file}</span>}
                    {preview.readme && (
                        <div className={styles.readmePreview}>
                            <pre>{preview.readme}</pre>
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Submitting...'
                        : isEditing
                            ? 'Update Showcase'
                            : 'Create Showcase'}
                </button>

                {userVideos.length > 0 && (
                    <div className={styles.formGroup}>
                        <label>Link Videos</label>
                        <div className={styles.videoGrid}>
                            {userVideos.map(video => (
                                <div
                                    key={video.id}
                                    className={`${styles.videoItem} ${selectedVideos.includes(video.id) ? styles.selected : ''
                                        }`}
                                    onClick={() => handleVideoSelection(video.id)}
                                >
                                    <img src={video.thumbnail_url} alt={video.title} />
                                    <span>{video.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {profile && (
                    <div className={styles.formGroup}>
                        <label>
                            <input
                                type="checkbox"
                                checked={includeProfile}
                                onChange={(e) => setIncludeProfile(e.target.checked)}
                            />
                            Link Developer Profile
                        </label>
                    </div>
                )}

                {/* <button
                    type="submit"
                    className={`${styles.submitButton} ${isSubmitting ? styles.submitting : ''}`}
                    disabled={isSubmitting}
                >
                    {isSubmitting
                        ? 'Submitting...'
                        : isEditing
                            ? 'Update Showcase'
                            : 'Create Showcase'}
                </button> */}
            </form>
        </div>
    );
};

export default ShowcaseForm;
