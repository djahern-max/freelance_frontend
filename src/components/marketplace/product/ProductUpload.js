import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { uploadProductFiles } from '../../../utils/marketplaceService';
import styles from './ProductUpload.module.css';

const ProductUpload = ({ productId, onUploadComplete, status = 'draft' }) => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [progress, setProgress] = useState(0);
    const [version, setVersion] = useState('1.0.0');

    const validateFiles = (selectedFiles) => {
        const maxSize = 100 * 1024 * 1024; // 100MB
        const allowedTypes = ['.exe', '.msi', '.zip'];

        for (const file of selectedFiles) {
            if (file.size > maxSize) {
                throw new Error(`File ${file.name} exceeds 100MB size limit`);
            }

            const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            if (!allowedTypes.includes(extension)) {
                throw new Error(`File ${file.name} has invalid type. Only .exe, .msi, and .zip allowed`);
            }
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        try {
            validateFiles(selectedFiles);
            setFiles(selectedFiles);
            setError('');
        } catch (err) {
            setError(err.message);
            e.target.value = null;
        }
    };

    const handleUpload = async () => {
        if (!files.length) {
            setError('Please select files to upload');
            return;
        }

        setUploading(true);
        setError('');
        setProgress(0);

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            formData.append('version', version);

            await uploadProductFiles(productId, formData, 'executable');
            onUploadComplete?.();
            setFiles([]);
            setProgress(100);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.uploadContainer}>
            {status === 'published' && (
                <div className={styles.versionControl}>
                    <label htmlFor="version" className={styles.versionLabel}>
                        Version:
                        <input
                            type="text"
                            id="version"
                            value={version}
                            onChange={(e) => setVersion(e.target.value)}
                            className={styles.versionInput}
                            pattern="\d+\.\d+\.\d+"
                            title="Please use semantic versioning (e.g., 1.0.0)"
                        />
                    </label>
                </div>
            )}

            <div
                className={styles.uploadBox}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    handleFileChange({ target: { files: e.dataTransfer.files } });
                }}
            >
                <Upload className={styles.uploadIcon} />
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".exe,.msi,.zip"
                    multiple
                    className={styles.fileInput}
                    disabled={uploading}
                />
                <p className={styles.uploadText}>
                    {files.length > 0
                        ? `Selected: ${files.map(f => f.name).join(', ')}`
                        : 'Drag & drop files or click to browse\nWindows: .exe, .msi\nMac: zipped application (.zip)'}
                </p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            {uploading && progress > 0 && (
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={uploading || !files.length}
                className={styles.uploadButton}
            >
                {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
        </div>
    );
};

export default ProductUpload;