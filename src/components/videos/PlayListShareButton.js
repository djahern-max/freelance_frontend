import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import styles from './MyPlaylists.module.css';

const PlayListShareButton = ({ playlistId }) => {
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [showShareDialog, setShowShareDialog] = useState(false);

    // Use callbacks for your functions to prevent unnecessary re-renders
    const generateShareLink = useCallback(async () => {
        if (isGeneratingLink) return;

        try {
            setIsGeneratingLink(true);
            const response = await api.post(`/playlists/${playlistId}/share`);

            // Construct the URL with the current domain
            const shareToken = response.data.share_token;
            const fullShareUrl = `${window.location.origin}/shared/playlists/${shareToken}`;

            setShareLink(fullShareUrl);
            setShowShareDialog(true);
        } catch (error) {
            console.error('Error generating share link:', error);
            toast.error('Failed to generate share link');
        } finally {
            setIsGeneratingLink(false);
        }
    }, [playlistId, isGeneratingLink]);

    const copyToClipboard = useCallback(() => {
        navigator.clipboard.writeText(shareLink)
            .then(() => {
                toast.success('Share link copied to clipboard');
            })
            .catch(() => {
                toast.error('Failed to copy link');
            });
    }, [shareLink]);

    const closeDialog = useCallback(() => {
        setShowShareDialog(false);
    }, []);

    return (
        <>
            <button
                className={`${styles.actionButton} ${styles.shareButton}`}
                onClick={generateShareLink}
                disabled={isGeneratingLink}
            >
                {isGeneratingLink ? 'Generating...' : 'Share'}
            </button>

            {showShareDialog && createPortal(
                <div className={styles.shareDialog}>
                    <div className={styles.shareDialogContent}>
                        <h3>Share Playlist</h3>
                        <p>Share this link with others to view this playlist:</p>
                        <div className={styles.shareLinkContainer}>
                            <input
                                type="text"
                                value={shareLink}
                                readOnly
                                className={styles.shareLinkInput}
                            />
                            <button
                                onClick={copyToClipboard}
                                className={styles.copyButton}
                            >
                                Copy
                            </button>
                        </div>
                        <button
                            onClick={closeDialog}
                            className={styles.closeButton}
                        >
                            Close
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default React.memo(PlayListShareButton);