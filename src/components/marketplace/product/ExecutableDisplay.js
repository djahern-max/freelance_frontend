// src/components/marketplace/product/ExecutableDisplay.js
import React, { useState, useEffect } from 'react';
import styles from './ExecutableDisplay.module.css';
import { Alert } from '../../shared/Alert';
import { Button } from '../../shared/Button';

const ExecutableDisplay = ({ productId }) => {
    const [executable, setExecutable] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloadStarted, setDownloadStarted] = useState(false);

    useEffect(() => {
        const fetchExecutableDetails = async () => {
            try {
                const response = await fetch(`/api/marketplace/products/${productId}`);
                if (!response.ok) throw new Error('Failed to fetch executable details');
                const data = await response.json();
                setExecutable(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchExecutableDetails();
    }, [productId]);

    const handleDownload = async () => {
        try {
            setDownloadStarted(true);
            const response = await fetch(`/api/marketplace/products/files/${productId}`);
            if (!response.ok) throw new Error('Failed to initiate download');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = executable?.files?.[0]?.file_name || 'download.exe';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError(err.message);
        } finally {
            setDownloadStarted(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <Alert type="error" message={error} />;
    }

    if (!executable) {
        return <Alert type="info" message="No executable found for this product." />;
    }

    return (
        <div className={styles.container}>
            {/* Product Header */}
            <div className={styles.header}>
                <h1 className={styles.title}>{executable.name}</h1>
                <p className={styles.description}>{executable.description}</p>

                {/* Version and Requirements */}
                <div className={styles.metaGrid}>
                    <div className={styles.metaItem}>
                        <h3 className={styles.metaTitle}>Version</h3>
                        <p>{executable.version}</p>
                    </div>
                    <div className={styles.metaItem}>
                        <h3 className={styles.metaTitle}>Category</h3>
                        <p>{executable.category}</p>
                    </div>
                </div>

                {/* System Requirements */}
                {executable.requirements && (
                    <div className={styles.requirements}>
                        <h3 className={styles.sectionTitle}>System Requirements</h3>
                        <pre className={styles.requirementsText}>
                            {executable.requirements}
                        </pre>
                    </div>
                )}

                {/* Download Section */}
                <div className={styles.downloadSection}>
                    <Button
                        onClick={handleDownload}
                        disabled={downloadStarted}
                        className={styles.downloadButton}
                    >
                        {downloadStarted ? 'Downloading...' : 'Download Executable'}
                    </Button>
                </div>

                {/* Installation Guide */}
                {executable.installation_guide && (
                    <div className={styles.installGuide}>
                        <h3 className={styles.sectionTitle}>Installation Guide</h3>
                        <div className={styles.guideContent}>
                            {executable.installation_guide}
                        </div>
                    </div>
                )}

                {/* Documentation Link */}
                {executable.documentation_url && (
                    <div className={styles.docLink}>
                        <a
                            href={executable.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.link}
                        >
                            View Documentation
                        </a>
                    </div>
                )}
            </div>

            {/* Stats Section */}
            <div className={styles.statsGrid}>
                <div className={styles.statsCard}>
                    <div className={styles.statsNumber}>{executable.download_count}</div>
                    <div className={styles.statsLabel}>Downloads</div>
                </div>
                <div className={styles.statsCard}>
                    <div className={styles.statsNumber}>{executable.view_count}</div>
                    <div className={styles.statsLabel}>Views</div>
                </div>
                <div className={styles.statsCard}>
                    <div className={styles.statsNumber}>
                        {executable.rating ? executable.rating.toFixed(1) : 'N/A'}
                    </div>
                    <div className={styles.statsLabel}>Rating</div>
                </div>
                <div className={styles.statsCard}>
                    <div className={styles.statsNumber}>${executable.price}</div>
                    <div className={styles.statsLabel}>Price</div>
                </div>
            </div>
        </div>
    );
};

export default ExecutableDisplay;