import React, { useState } from 'react';
import { Download, CheckCircle2, AlertCircle } from 'lucide-react';
import marketplaceService from '../../../utils/marketplaceService';
import styles from './ProductDownload.module.css';

const ProductDownload = ({ productId }) => {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloaded, setDownloaded] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/marketplace/products/files/${productId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get download URL');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'product_files.zip');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            setDownloaded(true);
        } catch (err) {
            console.error('Download error:', err);
            setError('Failed to download file. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.downloadSection}>
            {error ? (
                <div className={styles.error}>
                    <AlertCircle className={styles.errorIcon} />
                    <span>{error}</span>
                </div>
            ) : (
                <button
                    onClick={handleDownload}
                    className={`${styles.downloadButton} ${downloaded ? styles.downloaded : ''}`}
                    disabled={loading}
                >
                    {loading ? (
                        'Preparing download...'
                    ) : downloaded ? (
                        <>
                            <CheckCircle2 className={styles.icon} />
                            Downloaded
                        </>
                    ) : (
                        <>
                            <Download className={styles.icon} />
                            Download Files
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default ProductDownload;