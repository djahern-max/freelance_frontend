import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './PublishProject.module.css';

const PublishProject = ({ onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_url: '',
        repository_url: '',
        demo_url: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [readmeFile, setReadmeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.title || !formData.description) {
            toast.error('Title and description are required');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setError(null);

        try {
            const formPayload = new FormData();

            // Append text fields
            Object.entries(formData).forEach(([key, value]) => {
                if (value && value !== '') {
                    formPayload.append(key, value);
                }
            });

            // Append files if they exist
            if (imageFile) {
                formPayload.append('image_file', imageFile);
            }
            if (readmeFile) {
                formPayload.append('readme_file', readmeFile);
            }

            // Debug logging
            console.log('Form data contents:',
                Array.from(formPayload.entries()).map(([key, value]) =>
                    ({ key, value: value instanceof File ? `File: ${value.name}` : value })
                )
            );

            const response = await api.showcase.create(formPayload);
            console.log('Showcase created:', response);

            toast.success('Project published successfully!');
            onClose();
            navigate('/showcase');
        } catch (err) {
            console.error('Error publishing project:', err);
            const errorMessage = err?.response?.data?.detail || err.message || 'Failed to publish project';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (type === 'image') {
            if (!file.type.startsWith('image/')) {
                toast.error('Please upload a valid image file');
                return;
            }
            setImageFile(file);
        } else if (type === 'readme') {
            if (!file.name.endsWith('.md')) {
                toast.error('Please upload a markdown (.md) file');
                return;
            }
            setReadmeFile(file);
        }
    };

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <h2>Publish Project</h2>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className={styles.formGroup}>
                        <label htmlFor="title">Project Title *</label>
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
                        <label htmlFor="description">Description *</label>
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
                        <label>Project Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'image')}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>README File (.md)</label>
                        <input
                            type="file"
                            accept=".md"
                            onChange={(e) => handleFileChange(e, 'readme')}
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
                            placeholder="https://your-project.com"
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
                            placeholder="https://github.com/username/repo"
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
                            placeholder="https://demo.your-project.com"
                        />
                    </div>

                    <div className={styles.buttonGroup}>
                        <button
                            type="button"
                            onClick={onClose}
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
                            {loading ? 'Publishing...' : 'Publish'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PublishProject;