import React, { useState, useEffect } from 'react';
import styles from './ShowcaseForm.module.css';

const VideoSelectionComponent = ({
    availableVideos = [],
    initiallySelectedVideos = [],
    onSelectionChange,
    isEditing = false,
    showcaseId = null
}) => {
    const [selectedVideos, setSelectedVideos] = useState(initiallySelectedVideos);
    const [isSelectionBusy, setIsSelectionBusy] = useState(false);

    // Update parent component when selection changes
    useEffect(() => {
        if (onSelectionChange) {
            onSelectionChange(selectedVideos);
        }
    }, [selectedVideos, onSelectionChange]);

    // Handle video selection with API calls if in edit mode
    const handleVideoSelection = async (videoId, event) => {
        // Prevent default behavior if event is provided
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Prevent multiple rapid clicks
        if (isSelectionBusy) return;
        setIsSelectionBusy(true);

        try {
            // Update local state for immediate UI feedback
            setSelectedVideos(prev => {
                if (prev.includes(videoId)) {
                    return prev.filter(id => id !== videoId);
                } else {
                    return [...prev, videoId];
                }
            });

            // If in edit mode and has showcaseId, call API to link/unlink video
            if (isEditing && showcaseId) {
                const isCurrentlySelected = selectedVideos.includes(videoId);

                if (!isCurrentlySelected) {
                    // Video is being selected - link it
                    try {
                        await fetch(`/api/project-showcase/${showcaseId}/link-video/${videoId}`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        console.log(`Video ${videoId} linked successfully`);
                    } catch (error) {
                        console.error('Error linking video:', error);
                        // Revert the selection if API call fails
                        setSelectedVideos(prev => prev.filter(id => id !== videoId));
                    }
                } else {
                    // Video is being deselected - would need an unlink endpoint
                    console.log(`Video ${videoId} would be unlinked if endpoint existed`);
                    // Note: Your API might not have an unlink endpoint
                    // The changes will be submitted when the form is saved
                }
            }
        } catch (error) {
            console.error('Error in video selection:', error);
        } finally {
            // Release busy state after a short delay
            setTimeout(() => {
                setIsSelectionBusy(false);
            }, 300);
        }
    };

    // If no videos available
    if (!availableVideos || availableVideos.length === 0) {
        return (
            <div className={styles.formGroup}>
                <label>Link Videos</label>
                <p className={styles.noVideosMessage}>
                    No videos available to link. Upload videos first.
                </p>
            </div>
        );
    }

    return (
        <div className={styles.formGroup}>
            <label>Link Videos (Available: {availableVideos.length})</label>
            <div className={styles.videoTitleGrid}>
                {availableVideos.map(video => (
                    <div
                        key={video.id}
                        className={`${styles.videoTitleItem} ${selectedVideos.includes(video.id) ? styles.selected : ''}`}
                        onClick={(e) => handleVideoSelection(video.id, e)}
                        role="button"
                        tabIndex={0}
                        aria-pressed={selectedVideos.includes(video.id)}
                        onKeyDown={(e) => {
                            if ((e.key === 'Enter' || e.key === ' ') && !isSelectionBusy) {
                                handleVideoSelection(video.id, e);
                            }
                        }}
                    >
                        <div className={styles.videoTitle}>
                            {video.title || 'Untitled Video'}
                        </div>
                        {selectedVideos.includes(video.id) && (
                            <div className={styles.checkmark}>✓</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoSelectionComponent;