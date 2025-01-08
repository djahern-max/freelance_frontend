// src/components/showcase/ShowcaseForm.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createShowcase, updateShowcase, updateShowcaseFiles } from '../../redux/showcaseSlice';
import styles from './ShowcaseForm.module.css';

const ShowcaseForm = ({ showcase, isEditing = false }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error } = useSelector((state) => state.showcase);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_url: '',
        repository_url: '',
        demo_url: '',
        image_file: null,
        readme_file: null,
        selected_video_ids: [],
        include_profile: true
    });

    const [preview, setPreview] = useState({
        image: null,
        readme: null
    });

    useEffect(() => {
        if (showcase && isEditing) {
            setFormData({
                title: showcase.title || '',
                description: showcase.description || '',
                project_url: showcase.project_url || '',
                repository_url: showcase.repository_url || '',
                demo_url: showcase.demo_url || '',
                selected_video_ids: showcase.selected_video_ids || [],
                include_profile: true
            });
        }
    }, [showcase, isEditing]);

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

            // Create preview
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

        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                if (key === 'selected_video_ids') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            }
        });

        try {
            if (isEditing && showcase) {
                // Handle file updates separately if files have changed
                if (formData.image_file || formData.readme_file) {
                    const fileFormData = new FormData();
                    if (formData.image_file) fileFormData.append('image_file', formData.image_file);
                    if (formData.readme_file) fileFormData.append('readme_file', formData.readme_file);
                    await dispatch(updateShowcaseFiles({ id: showcase.id, formData: fileFormData }));
                }

                // Update other fields
                const updateData = {
                    title: formData.title,
                    description: formData.description,
                    project_url: formData.project_url,
                    repository_url: formData.repository_url,
                    demo_url: formData.demo_url
                };
                await dispatch(updateShowcase({ id: showcase.id, data: updateData }));
            } else {
                await dispatch(createShowcase(submitData));
            }
            navigate('/showcase');
        } catch (err) {
            console.error('Error submitting showcase:', err);
        }
    };

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
};

export default ShowcaseForm;