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
            const response = await fetch(`/project-showcase/${showcaseId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to generate share link');
            }

            const data = await response.json();
            const fullShareUrl = `${window.location.origin}/showcase/${showcaseId}`;
            setShareUrl(fullShareUrl);
            if (onShare) onShare(fullShareUrl);
        } catch (err) {
            setError('Failed to generate share link. Please try again.');
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