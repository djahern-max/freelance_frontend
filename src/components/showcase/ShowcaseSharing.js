import React, { useState } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import styles from './ShowcaseSharing.module.css';

const ShowcaseSharing = ({ showcaseId, onShare }) => {
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const generateShareLink = async () => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('You must be logged in to share a showcase');
            }

            // Use the correct endpoint path without /api prefix
            // Your NGINX config is handling the /api prefix
            const response = await fetch(`/api/project-showcase/${showcaseId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Authentication failed. Please log in again.');
                }
                throw new Error('Failed to generate share link');
            }

            const data = await response.json();

            // Use the exact format returned by the server, plus origin
            const fullShareUrl = `${window.location.origin}${data.share_url}`;
            setShareUrl(fullShareUrl);
            if (onShare) onShare(fullShareUrl);
        } catch (err) {
            console.error('Share error:', err);
            setError(err.message || 'Failed to generate share link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            setError('Failed to copy link. Please try manually.');
        }
    };

    return (
        <div className={styles.shareContainer}>
            {error && (
                <div className={styles.error}>
                    {error}
                </div>
            )}

            {!shareUrl ? (
                <button
                    onClick={generateShareLink}
                    disabled={loading}
                    className={styles.shareButton}
                >
                    <Share2 className={styles.icon} />
                    {loading ? 'Generating Link...' : 'Share Showcase'}
                </button>
            ) : (
                <div className={styles.shareUrlContainer}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className={styles.shareInput}
                        />
                        <button
                            className={`${styles.copyButton} ${copied ? styles.copied : ''}`}
                            onClick={copyToClipboard}
                        >
                            {copied ? (
                                <Check className={styles.icon} />
                            ) : (
                                <Copy className={styles.icon} />
                            )}
                        </button>
                    </div>

                    <p className={styles.helpText}>
                        Anyone with this link can view your showcase
                    </p>
                </div>
            )}
        </div>
    );
};

export default ShowcaseSharing;