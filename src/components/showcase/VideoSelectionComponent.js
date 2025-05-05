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
                                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
                            },
                        });
                        console.log(`Video ${videoId} linked successfully`);

                        // Update local state after successful API call
                        setSelectedVideos(prev => [...prev, videoId]);
                    } catch (error) {
                        console.error('Error linking video:', error);
                        throw error; // Let the outer catch handle the error
                    }
                } else {
                    // Video is being deselected - unlink it
                    try {
                        await fetch(`/api/project-showcase/${showcaseId}/link-video/${videoId}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}` // Add auth token
                            },
                        });
                        console.log(`Video ${videoId} unlinked successfully`);

                        // Update local state after successful API call
                        setSelectedVideos(prev => prev.filter(id => id !== videoId));
                    } catch (error) {
                        console.error('Error unlinking video:', error);
                        throw error; // Let the outer catch handle the error
                    }
                }
            } else {
                // If not editing, just update local state
                setSelectedVideos(prev => {
                    if (prev.includes(videoId)) {
                        return prev.filter(id => id !== videoId);
                    } else {
                        return [...prev, videoId];
                    }
                });
            }
        } catch (error) {
            console.error('Error in video selection:', error);
            // Don't update local state if API call failed
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