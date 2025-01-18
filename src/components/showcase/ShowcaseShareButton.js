import React, { useState } from 'react';
import { Send } from 'lucide-react';
import styles from './ShowcaseShareButton.module.css';

const ShowcaseShareButton = ({ showcaseId }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');

    const handleShare = async () => {
        setIsSharing(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/project-showcase/${showcaseId}/share`, {
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
            setCopyStatus('Failed to share');
        } finally {
            setIsSharing(false);
            setTimeout(() => setCopyStatus(''), 2000);
        }
    };

    return (
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
    );
};

export default ShowcaseShareButton;

