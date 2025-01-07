// components/shared/ShareButton.js
import React from 'react';
import { Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ShareButton.module.css';

const ShareButton = ({ showcaseId, videoId, projectUrl }) => {
    const handleShare = async () => {
        try {
            let shareUrl;
            if (showcaseId) {
                const response = await api.post(`/project-showcase/${showcaseId}/share`);
                shareUrl = `${window.location.origin}/showcase/shared/${response.data.share_token}`;
            } else if (videoId) {
                const response = await api.post(`/videos/${videoId}/share`);
                shareUrl = `${window.location.origin}/shared/videos/${response.data.share_token}`;
            } else {
                shareUrl = projectUrl;
            }

            await navigator.clipboard.writeText(shareUrl);
            toast.success('Share link copied to clipboard!');
        } catch (error) {
            console.error('Share error:', error);
            toast.error('Failed to generate share link');
        }
    };

    return (
        <button onClick={handleShare} className={styles.shareButton}>
            <Share2 size={16} className={styles.icon} />
            <span>Share {showcaseId ? 'Project' : 'Video'}</span>
        </button>
    );
};

export default ShareButton;