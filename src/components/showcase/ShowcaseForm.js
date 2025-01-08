// src/components/showcase/ShowcaseForm.js
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
    const [profile, setProfile] = useState(null);
    const [apiLoading, setApiLoading] = useState(false);
    const [apiError, setApiError] = useState(null);

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
        if (currentShowcase && isEditing) {
            setFormData({
                title: currentShowcase.title || '',
                description: currentShowcase.description || '',
                project_url: currentShowcase.project_url || '',
                repository_url: currentShowcase.repository_url || '',
                demo_url: currentShowcase.demo_url || ''
            });
        }
    }, [currentShowcase, isEditing]);

    useEffect(() => {
        const fetchData = async () => {
            setApiLoading(true);
            try {
                // Fetch videos
                const videosResponse = await api.get('/video_display/my-videos');
                const videosList = videosResponse.data.videos || [];
                setVideos(videosList);

                // Fetch profile
                const profileResponse = await api.get('/profile/developer');
                setProfile(profileResponse.data);
            } catch (err) {
                console.error('Error fetching data:', err);
                setApiError(err.message);
            } finally {
                setApiLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const submitData = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            const response = await dispatch(createShowcase(submitData)).unwrap();
            if (response && response.id) {
                setCreatedShowcase(response);
                setShowLinkedContent(true);
            }
        } catch (err) {
            console.error('Error submitting showcase:', err);
        }
    };

    const handleFinish = () => {
        navigate('/showcase');
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
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
                <label htmlFor="title">Title *</label>
                <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="description">Description *</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    className={styles.textarea}
                />
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
                    className={styles.input}
                    placeholder="https://"
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
                    className={styles.input}
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
                    className={styles.input}
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
                    className={styles.fileInput}
                />
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
                    className={styles.fileInput}
                />
                {preview.readme && (
                    <div className={styles.readmePreview}>
                        <pre>{preview.readme}</pre>
                    </div>
                )}
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
            >
                {loading ? 'Submitting...' : isEditing ? 'Update Showcase' : 'Create Showcase'}
            </button>
        </form>

    );
}


export default ShowcaseForm;