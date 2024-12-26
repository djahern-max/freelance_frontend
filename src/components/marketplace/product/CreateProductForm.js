import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectToken, selectIsAuthenticated } from '../../../redux/authSlice';
import { X } from 'lucide-react'; // Import X icon for close button
import api from '../../../utils/api';
import styles from './CreateProductForm.module.css';

const CreateProductForm = ({ onSuccess, onClose }) => {
    const token = useSelector(selectToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        long_description: '',
        price: '',
        category: 'automation',
        status: 'DRAFT'
    });

    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
            <button
                onClick={onClose}
                className={styles.closeButton}
                aria-label="Close form"
            >
                <X size={16} />
            </button>

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGroup}>
                    <label>Upload Executable Files (.exe, .msi)</label>
                    <div
                        className={styles.fileUploadArea}
                        onClick={(e) => {
                            e.stopPropagation();
                            const fileInput = e.currentTarget.querySelector('input[type="file"]');
                            if (fileInput) fileInput.click();
                        }}
                    >
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
                        <input
                            type="file"
                            onChange={handleFileChange}
                            multiple
                            required
                            className={styles.fileInput}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="name">Product Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter product name"
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
                        placeholder="Brief description of your product"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="long_description">Long Description</label>
                    <textarea
                        id="long_description"
                        name="long_description"
                        value={formData.long_description}
                        onChange={handleChange}
                        required
                        placeholder="Detailed description of your product"
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
                        placeholder="0.00"
                    />
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

                {/* Added Product Status Section */}
                <div className={styles.formGroup}>
                    <label htmlFor="status">Product Status</label>
                    <div className={styles.statusContainer}>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="DRAFT">Draft - Not visible in marketplace</option>
                            <option value="PUBLISHED">Published - Visible and available for purchase</option>
                        </select>
                        <p className={styles.statusHelp}>
                            {formData.status === 'DRAFT'
                                ? "Draft products are only visible to you and can be edited before publishing."
                                : "Published products are immediately visible in the marketplace and available for purchase."}
                        </p>
                    </div>
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
                    {isSubmitting ? 'Creating Product...' : 'Create Product'}
                </button>
            </form>
        </div>
    );
};

export default CreateProductForm;