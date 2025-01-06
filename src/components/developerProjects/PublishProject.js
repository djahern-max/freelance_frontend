import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';
import api from '../../utils/api';
import styles from './PublishProject.module.css';

const PublishProject = ({ onClose }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project_url: '',
        repository_url: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        setImageFile(file);
    };

    const handleReadmeChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.md')) {
            toast.error('Please upload a markdown (.md) file');
            return;
        }
        setReadmeFile(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const removeReadme = () => {
        setReadmeFile(null);
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            toast.error('Title is required');
            return false;
        }
        if (!formData.description.trim()) {
            toast.error('Description is required');
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
                if (value && value.trim() !== '') {
                    formPayload.append(key, value.trim());
                }
            });

            // Append files if they exist
            if (imageFile) {
                formPayload.append('image_file', imageFile);
            }
            if (readmeFile) {
                formPayload.append('readme_file', readmeFile);
            }

            const response = await api.post('/project-showcase/', formPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

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
                            onChange={handleImageChange}
                            className={styles.fileInput}
                        />
                        {imagePreview && (
                            <div className={styles.imagePreviewContainer}>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className={styles.imagePreview}
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className={styles.removeButton}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label>README File (.md)</label>
                        <input
                            type="file"
                            accept=".md"
                            onChange={handleReadmeChange}
                            className={styles.fileInput}
                        />
                        {readmeFile && (
                            <div className={styles.fileInfo}>
                                <span>{readmeFile.name}</span>
                                <button
                                    type="button"
                                    onClick={removeReadme}
                                    className={styles.removeButton}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        )}
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