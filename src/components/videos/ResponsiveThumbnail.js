import React, { useState } from 'react';
import { Play } from 'lucide-react';

const ResponsiveThumbnail = ({ video, onClick, className }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Choose the appropriate thumbnail size based on screen width
    const getThumbnailUrl = () => {
        if (!video.thumbnail_path) return null;

        // Use small thumbnail for mobile devices
        if (window.innerWidth < 640) {
            return video.thumbnail_small || video.thumbnail_path;
        }

        // Use large thumbnail for large screens
        if (window.innerWidth > 1280) {
            return video.thumbnail_large || video.thumbnail_path;
        }

        // Use medium (default) thumbnail for everything else
        return video.thumbnail_path;
    };

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setError(true);
        setIsLoading(false);
    };

    return (
        <div className={`${styles.thumbnailContainer} ${className}`} onClick={onClick}>
            {getThumbnailUrl() ? (
                <>
                    <img
                        src={getThumbnailUrl()}
                        alt={video.title || 'Video Thumbnail'}
                        className={`${styles.thumbnail} ${isLoading ? styles.loading : ''}`}
                        onLoad={handleLoad}
                        onError={handleError}
                        loading="lazy"
                    />
                    <div className={styles.playButton}>
                        <Play size={24} />
                    </div>
                    {isLoading && (
                        <div className={styles.loadingOverlay}>
                            <div className={styles.loadingSpinner} />
                        </div>
                    )}
                </>
            ) : (
                <div className={styles.thumbnailPlaceholder}>
                    <Play size={32} className={styles.playButtonIcon} />
                </div>
            )}
        </div>
    );
};

export default ResponsiveThumbnail;