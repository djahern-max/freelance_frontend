// src/components/marketplace/product/ProductUpload.js
import { useState } from 'react';
import Alert from '../../shared/Alert';
import Button from '../../shared/Button';
import styles from './ProductUpload.module.css';

const ProductUpload = ({ productId }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);

        // Validate file types
        const validFiles = selectedFiles.filter(file =>
            file.name.endsWith('.exe') || file.name.endsWith('.msi')
        );

        if (validFiles.length !== selectedFiles.length) {
            setError('Only .exe and .msi files are allowed');
            return;
        }

        // Validate file sizes (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB in bytes
        const oversizedFiles = validFiles.filter(file => file.size > maxSize);

        if (oversizedFiles.length > 0) {
            setError('Files must be under 100MB');
            return;
        }

        setFiles(validFiles);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        formData.append('file_type', 'executable');

        try {
            const response = await fetch(`/api/marketplace/products/files/${productId}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            // Handle success
            setFiles([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Upload Product Files</h2>

            {error && (
                <Alert message={error} type="error" />
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.dropZone}>
                    <input
                        type="file"
                        multiple
                        accept=".exe,.msi"
                        onChange={handleFileChange}
                        className={styles.fileInput}
                    />
                    <p className={styles.helpText}>
                        Drag and drop your executable files here or click to browse.
                        Maximum file size: 100MB
                    </p>
                </div>

                {files.length > 0 && (
                    <div className={styles.fileList}>
                        <h3 className={styles.fileListTitle}>Selected Files:</h3>
                        <ul className={styles.fileListItems}>
                            {files.map((file, index) => (
                                <li key={index} className={styles.fileItem}>
                                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <Button
                    label={uploading ? 'Uploading...' : 'Upload Files'}
                    disabled={files.length === 0 || uploading}
                    className={styles.submitButton}
                />
            </form>
        </div>
    );
};

export default ProductUpload;