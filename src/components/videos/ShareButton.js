import { Share } from 'lucide-react';
import { useState } from 'react';
import styles from './ShareButton.module.css';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const ShareButton = ({ videoId, projectUrl }) => {
    const [isSharing, setIsSharing] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const [showFallbackCopy, setShowFallbackCopy] = useState(false);
    const [failed, setFailed] = useState(false);

    const copyToClipboard = async (url) => {
        try {
            // Modern way to copy text
            await navigator.clipboard.writeText(url);
            setShowCopiedMessage(true);
            toast.success('Share link copied to clipboard!');
            setTimeout(() => setShowCopiedMessage(false), 2000);
        } catch (error) {
            // Fallback method if clipboard API fails
            console.error('Error copying to clipboard:', error);
            setShowFallbackCopy(true);
            setFailed(true);
            toast.error('Failed to copy link. Use the copy button below.');
        }
    };

    const handleShare = async () => {
        if (isSharing) return;

        try {
            setIsSharing(true);
            const response = await api.videos.shareVideo(videoId, projectUrl);
            setShareUrl(response.share_url);
            await copyToClipboard(response.share_url);
        } catch (error) {
            console.error('Error sharing video:', error);
            toast.error(error.message || 'Failed to generate share link');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <div className={styles.container}>
            <button
                onClick={handleShare}
                className={`${styles.shareButton} ${isSharing ? styles.sharing : ''}`}
                disabled={isSharing}
                aria-label={isSharing ? 'Generating share link...' : 'Share Video'}
            >
                <Share size={20} className={styles.icon} />
                <span>{isSharing ? 'Generating...' : 'Share Video'}</span>
            </button>

            {shareUrl && (
                <div className={styles.shareUrl}>
                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className={styles.urlInput}
                        aria-label="Share URL"
                    />
                    <button
                        onClick={() => copyToClipboard(shareUrl)}
                        className={styles.copyButton}
                        aria-label="Copy share link"
                        disabled={showCopiedMessage}
                    >
                        {showCopiedMessage ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            )}

            {failed && showFallbackCopy && (
                <div className={styles.fallbackCopy}>
                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className={styles.fallbackInput}
                    />
                    <button
                        onClick={() => {
                            const input = document.querySelector(`.${styles.fallbackInput}`);
                            input.select();
                            document.execCommand('copy');
                            setShowCopiedMessage(true);
                            toast.success('Share link copied to clipboard!');
                            setTimeout(() => setShowCopiedMessage(false), 2000);
                        }}
                        className={styles.fallbackButton}
                    >
                        Copy Link
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShareButton;