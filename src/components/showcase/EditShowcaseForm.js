import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ShowcaseForm.module.css';

const EditShowcaseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [showcase, setShowcase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [repositoryUrl, setRepositoryUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [readmeFile, setReadmeFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [readmePreview, setReadmePreview] = useState(null);

    const imageInputRef = useRef(null);
    const readmeInputRef = useRef(null);

    useEffect(() => {
        const fetchShowcase = async () => {
            try {
                const response = await api.get(`/project-showcase/${id}`);
                const data = response.data;
                setShowcase(data);
                setTitle(data.title);
                setDescription(data.description);
                setProjectUrl(data.project_url || '');
                setRepositoryUrl(data.repository_url || '');
                setImagePreview(data.image_url);

                if (data.readme_url) {
                    const readmeResponse = await api.get(`/project-showcase/${id}/readme`);
                    setReadmePreview(readmeResponse.data.content);
                }
            } catch (error) {
                toast.error('Failed to load showcase');
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchShowcase();
    }, [id]);

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Please select a valid image file');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be under 5MB');
                return;
            }

            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleReadmeSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.md')) {
                toast.error('Please select a markdown (.md) file');
                return;
            }

            if (file.size > 1024 * 1024) {
                toast.error('README must be under 1MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setReadmePreview(e.target.result);
                setReadmeFile(file);
            };
            reader.readAsText(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            // First, handle file uploads if any
            if (imageFile || readmeFile) {
                const formData = new FormData();
                if (imageFile) formData.append('image_file', imageFile);
                if (readmeFile) formData.append('readme_file', readmeFile);

                // Upload files first if they exist
                if (formData.has('image_file') || formData.has('readme_file')) {
                    await api.post(`/project-showcase/${id}/files`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                }
            }

            // Then update the showcase data
            const showcaseData = {
                title: title.trim(),
                description: description.trim(),
                project_url: projectUrl || null,
                repository_url: repositoryUrl || null,
            };

            await api.put(`/project-showcase/${id}`, showcaseData, {
                headers: { 'Content-Type': 'application/json' },
            });

            toast.success('Project showcase updated successfully!');
            navigate(`/showcase/${id}`);
        } catch (error) {
            console.error('Error updating showcase:', error);
            toast.error(error.response?.data?.detail || 'Failed to update showcase');
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formContainer}>
                <div className={styles.formHeader}>
                    <button className={styles.backButton} onClick={() => navigate(-1)}>
                        <X size={16} />
                        Cancel
                    </button>
                    <h1 className={styles.title}>Edit Project Showcase</h1>
                </div>

                <form onSubmit={handleSubmit} className={styles.uploadForm}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Title *</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter project title"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Description *</label>
                        <textarea
                            className={styles.textarea}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your project"
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Project URL</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={projectUrl}
                            onChange={(e) => setProjectUrl(e.target.value)}
                            placeholder="https://your-project.com"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Repository URL</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={repositoryUrl}
                            onChange={(e) => setRepositoryUrl(e.target.value)}
                            placeholder="https://github.com/your-repo"
                        />
                    </div>

                    <div className={styles.uploadButtons}>
                        <button
                            type="button"
                            className={styles.uploadButton}
                            onClick={() => imageInputRef.current?.click()}
                        >
                            <Upload size={24} />
                            <span>{imageFile ? 'Change Image' : 'Select Image'}</span>
                            <div className={styles.uploadRequirements}>
                                <small>Recommended: 1200x630 pixels</small>
                                <small>Max file size: 5MB</small>
                                <small>Formats: JPG, PNG, WebP</small>
                            </div>
                        </button>

                        <button
                            type="button"
                            className={styles.uploadButton}
                            onClick={() => readmeInputRef.current?.click()}
                        >
                            <FileText size={24} />
                            <span>{readmeFile ? 'Change README' : 'Select README'}</span>
                            <div className={styles.uploadRequirements}>
                                <small>Format: Markdown (.md)</small>
                                <small>Max file size: 1MB</small>
                            </div>
                        </button>

                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />

                        <input
                            ref={readmeInputRef}
                            type="file"
                            accept=".md"
                            onChange={handleReadmeSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {imagePreview && (
                        <div className={styles.previewContainer}>
                            <img
                                src={imagePreview}
                                alt="Project preview"
                                className={styles.imagePreview}
                            />
                        </div>
                    )}

                    {readmePreview && (
                        <div className={styles.previewContainer}>
                            <div className={styles.readmePreview}>
                                <h3>README Preview</h3>
                                <pre>{readmePreview}</pre>
                            </div>
                        </div>
                    )}

                    <div className={styles.submitButtonContainer}>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={uploading}
                        >
                            {uploading ? 'Updating...' : 'Update Showcase'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditShowcaseForm;