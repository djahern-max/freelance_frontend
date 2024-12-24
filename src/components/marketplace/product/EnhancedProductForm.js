import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectToken, selectIsAuthenticated } from '../../../redux/authSlice';
import api from '../../../utils/api';
import styles from './CreateProductForm.module.css';

const EnhancedProductForm = ({ onSuccess }) => {
    const token = useSelector(selectToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        long_description: '',
        price: '',
        category: 'automation',
        video_ids: [],
        profile_visible: true
    });

    const [files, setFiles] = useState([]);
    const [availableVideos, setAvailableVideos] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                const response = await api.videos.getUserVideos();
                setAvailableVideos(response.videos || []);
            } catch (err) {
                console.error('Error fetching videos:', err);
            }
        };
        fetchVideos();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleVideoSelect = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
        setFormData(prev => ({
            ...prev,
            video_ids: selectedOptions
        }));
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || !token) {
            setError('You must be logged in to create a product');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const product = await api.marketplace.createProduct({
                ...formData,
                price: parseFloat(formData.price)
            });

            if (files.length > 0) {
                await api.marketplace.uploadProductFiles(product.id, files);
            }

            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Existing file upload fields */}
                <div className={styles.formGroup}>
                    <label>Upload Files (.exe, .msi, .zip)</label>
                    <div className={styles.fileUploadArea}>
                        <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            required
                            className={styles.fileInput}
                            accept=".exe,.msi,.zip"
                        />
                        <div className={styles.uploadPrompt}>
                            {files.length > 0 ? (
                                <div className={styles.fileList}>
                                    {files.map((file, index) => (
                                        <div key={index} className={styles.fileItem}>
                                            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <span>Click here to choose files</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Basic product information */}
                <div className={styles.formGroup}>
                    <label htmlFor="name">Product Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Short Description</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="long_description">Detailed Description</label>
                    <textarea
                        id="long_description"
                        name="long_description"
                        value={formData.long_description}
                        onChange={handleChange}
                        required
                        rows={4}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="price">Price ($)</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                    />
                    <small className={styles.commission}>
                        Platform fee: 5% (${formData.price ? (parseFloat(formData.price) * 0.05).toFixed(2) : '0.00'})
                    </small>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                    >
                        <option value="automation">Automation</option>
                        <option value="programming">Programming</option>
                        <option value="marketing">Marketing</option>
                        <option value="data_analysis">Data Analysis</option>
                        <option value="content_creation">Content Creation</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                {/* Profile and video attachments */}
                <div className={styles.formGroup}>
                    <label>
                        <input
                            type="checkbox"
                            name="profile_visible"
                            checked={formData.profile_visible}
                            onChange={handleChange}
                        />
                        Show my developer profile with this product
                    </label>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="videos">Attach Videos</label>
                    <select
                        id="videos"
                        multiple
                        value={formData.video_ids}
                        onChange={handleVideoSelect}
                        className={styles.videoSelect}
                    >
                        {availableVideos.map(video => (
                            <option key={video.id} value={video.id}>
                                {video.title}
                            </option>
                        ))}
                    </select>
                    <small>Hold Ctrl/Cmd to select multiple videos</small>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Creating Product...' : 'List Product'}
                </button>
            </form>
        </div>
    );
};

export default EnhancedProductForm;