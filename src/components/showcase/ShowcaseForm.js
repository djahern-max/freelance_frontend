import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createShowcase } from '../../redux/showcaseSlice';
import LinkedContent from './LinkedContent';
import styles from './ShowcaseForm.module.css';
import api from '../../utils/api';

const ShowcaseForm = ({
    isEditing = false,
    initialData = {},
    onSubmit,
    availableVideos = [],
    developerProfile = null
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_url: '',
        repository_url: '',
        demo_url: '',
        image_file: null,
        readme_file: null
    });

    const [selectedVideos, setSelectedVideos] = useState([]);
    const [includeProfile, setIncludeProfile] = useState(false);
    const [preview, setPreview] = useState({ image: null, readme: null });
    const [formErrors, setFormErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [apiError, setApiError] = useState(null);
    const [showLinkedContent, setShowLinkedContent] = useState(false);
    const [createdShowcase, setCreatedShowcase] = useState(null);

    // Initialize form with initial data if editing
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                project_url: initialData.project_url || '',
                repository_url: initialData.repository_url || '',
                demo_url: initialData.demo_url || '',
                image_file: null,
                readme_file: null
            });
            setSelectedVideos(initialData.selectedVideos || []);
            setIncludeProfile(initialData.includeProfile || false);
        }
    }, [initialData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
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
        if (!formData.title.trim()) errors.title = 'Title is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.project_url.trim()) errors.project_url = 'Project URL is required';

        if (!isEditing) {
            if (!formData.image_file) errors.image_file = 'Project image is required';
            if (!formData.readme_file) errors.readme_file = 'README file is required';
        }

        return errors;
    };

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
            if (isEditing) {
                await onSubmit({
                    ...formData,
                    selectedVideos,
                    includeProfile
                });
            } else {
                // Create new showcase logic
                const submitData = new FormData();
                Object.keys(formData).forEach(key => {
                    if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                        submitData.append(key, formData[key]);
                    }
                });

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
        } catch (error) {
            console.error('Error submitting showcase:', error);
            setApiError(error.message || 'Error submitting showcase');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (showLinkedContent) {
        return (
            <div className={styles.container}>
                <LinkedContent
                    showcase={createdShowcase}
                    videos={availableVideos}
                    profileUrl={developerProfile?.profile_url}
                    isLoading={isSubmitting}
                    error={apiError}
                    onComplete={() => navigate('/showcase')}
                />
            </div>
        );
    }

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            {successMessage && (
                <div className={styles.successMessage}>{successMessage}</div>
            )}
            {apiError && (
                <div className={styles.errorMessage}>{apiError}</div>
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

            {availableVideos.length > 0 && (
                <div className={styles.formGroup}>
                    <label>Link Videos</label>
                    <div className={styles.videoGrid}>
                        {availableVideos.map(video => (
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

            {developerProfile && (
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
        </form>
    );
};

export default ShowcaseForm;