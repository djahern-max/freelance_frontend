import { Upload, X, FileText, Link as LinkIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ShowcaseForm.module.css';

const ShowcaseForm = ({ projectId, onUploadSuccess }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [projectUrl, setProjectUrl] = useState('');
    const [repositoryUrl, setRepositoryUrl] = useState('');
    const [demoUrl, setDemoUrl] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [readmeFile, setReadmeFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [readmePreview, setReadmePreview] = useState(null);

    const navigate = useNavigate();
    const imageInputRef = useRef(null);
    const readmeInputRef = useRef(null);

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);
        if (type === 'success') {
            setTimeout(() => {
                setMessage(null);
                setMessageType(null);
            }, 5000);
        }
    };

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showMessage('Please select a valid image file', 'error');
                return;
            }

            // Check file size - 5MB limit
            if (file.size > 5 * 1024 * 1024) {
                showMessage('Image must be under 5MB', 'error');
                return;
            }

            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(img.src);
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
                showMessage(null);
            };

            img.onerror = () => {
                showMessage('Failed to load image. Please try another file.', 'error');
            };

            img.src = URL.createObjectURL(file);
        }
    };

    const handleReadmeSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.md')) {
                showMessage('Please select a markdown (.md) file', 'error');
                return;
            }

            // Check file size - 1MB limit for README
            if (file.size > 1024 * 1024) {
                showMessage('README must be under 1MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setReadmePreview(e.target.result);
                setReadmeFile(file);
                showMessage(null);
            };

            reader.onerror = () => {
                showMessage('Failed to read README file. Please try again.', 'error');
            };

            reader.readAsText(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) {
            showMessage('Please enter a title', 'error');
            return;
        }

        if (!description.trim()) {
            showMessage('Please enter a description', 'error');
            return;
        }

        setUploading(true);
        showMessage('Creating showcase... Please wait', 'loading');

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);

        if (projectUrl) formData.append('project_url', projectUrl);
        if (repositoryUrl) formData.append('repository_url', repositoryUrl);
        if (demoUrl) formData.append('demo_url', demoUrl);
        if (imageFile) formData.append('image_file', imageFile);
        if (readmeFile) formData.append('readme_file', readmeFile);

        try {
            const response = await api.post('/project-showcase/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setTitle('');
            setDescription('');
            setProjectUrl('');
            setRepositoryUrl('');
            setDemoUrl('');
            setImageFile(null);
            setReadmeFile(null);
            setImagePreview(null);
            setReadmePreview(null);

            showMessage('Project showcase created successfully!', 'success');

            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }

            // Navigate to the showcase page
            navigate(`/showcase/${response.data.id}`);
        } catch (err) {
            console.error('Error creating showcase:', err);
            showMessage(err.response?.data?.detail || 'Failed to create showcase', 'error');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formContainer}>
                <button className={styles.backButton} onClick={() => navigate(-1)}>
                    <X size={16} />
                    Cancel
                </button>

                <h1 className={styles.title}>Create Project Showcase</h1>

                <form onSubmit={handleSubmit} className={styles.uploadForm}>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Title *</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter project title"
                            disabled={uploading}
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
                            disabled={uploading}
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
                            disabled={uploading}
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
                            disabled={uploading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Demo URL</label>
                        <input
                            type="url"
                            className={styles.input}
                            value={demoUrl}
                            onChange={(e) => setDemoUrl(e.target.value)}
                            placeholder="https://demo.your-project.com"
                            disabled={uploading}
                        />
                    </div>

                    <div className={styles.uploadButtons}>
                        <button
                            type="button"
                            className={styles.uploadButton}
                            onClick={() => imageInputRef.current?.click()}
                            disabled={uploading}
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
                            disabled={uploading}
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
                            disabled={uploading}
                        />

                        <input
                            ref={readmeInputRef}
                            type="file"
                            accept=".md"
                            onChange={handleReadmeSelect}
                            style={{ display: 'none' }}
                            disabled={uploading}
                        />
                    </div>

                    {imagePreview && (
                        <div className={styles.preview}>
                            <img
                                src={imagePreview}
                                alt="Project preview"
                                className={styles.imagePreview}
                            />
                        </div>
                    )}

                    {readmePreview && (
                        <div className={styles.preview}>
                            <div className={styles.readmePreview}>
                                <h3>README Preview</h3>
                                <pre>{readmePreview}</pre>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={styles[messageType]}>
                            {message}
                        </div>
                    )}

                    <div className={styles.submitButtonContainer}>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <>
                                    <span className={styles.spinner} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="mr-2" />
                                    Create Showcase
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShowcaseForm;