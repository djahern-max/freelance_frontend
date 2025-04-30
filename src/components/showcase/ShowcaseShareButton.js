import React, { useState } from 'react';
import { Send } from 'lucide-react';
import styles from './ShowcaseShareButton.module.css';

const ShowcaseShareButton = ({ showcaseId }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');
    const [error, setError] = useState('');

    const handleShare = async () => {
        setIsSharing(true);
        setError('');
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Please log in to share');
            }

            // Use the correct endpoint path with /api prefix
            const response = await fetch(`/api/project-showcase/${showcaseId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Please log in to share');
                }
                throw new Error('Failed to generate share link');
            }

            const data = await response.json();

            // Use the exact format returned by the backend
            const fullShareUrl = `${window.location.origin}${data.share_url}`;

            if (navigator.share) {
                await navigator.share({
                    title: 'Check out this showcase',
                    url: fullShareUrl
                });
                setCopyStatus('Shared!');
            } else {
                await navigator.clipboard.writeText(fullShareUrl);
                setCopyStatus('Link copied!');
            }
        } catch (err) {
            console.error('Sharing failed:', err);
            setError(err.message);
            setCopyStatus('Failed to share');
        } finally {
            setIsSharing(false);
            setTimeout(() => {
                setCopyStatus('');
                setError('');
            }, 3000);
        }
    };

    return (
        <>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <button
                onClick={handleShare}
                className={styles.shareButton}
                disabled={isSharing}
            >
                {isSharing ? (
                    '⌛'
                ) : (
                    <>
                        <Send className={styles.shareIcon} />
                        {copyStatus || 'Share Project'}
                    </>
                )}
            </button>
        </>
    );
};

export default ShowcaseShareButton;