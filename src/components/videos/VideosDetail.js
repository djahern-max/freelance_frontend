// src/components/videos/VideosDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchVideoById } from '../../redux/videoSlice';
import AddToPlaylistButton from './AddToPlaylistButton';
import ShareButton from './ShareButton';
import EditVideoModal from './VideoEdit'; // Add this import
import { getFullAssetUrl, deleteVideo } from '../../utils/videoUtils';
import styles from './VideosDetail.module.css';

const VideosDetail = () => {
    const { videoId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // Add this state

    const { currentVideo, loading, error } = useSelector(state => state.videos);
    const { user } = useSelector(state => state.auth);

    const isOwner = user && currentVideo && user.id === currentVideo.user_id;

    useEffect(() => {
        if (videoId) {
            dispatch(fetchVideoById(parseInt(videoId)));
        }
    }, [dispatch, videoId]);

    const handleDelete = async () => {
        try {
            await deleteVideo(videoId);
            toast.success('Video deleted successfully');
            navigate('/videos');
        } catch (error) {
            toast.error('Failed to delete video: ' + error.message);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Loading video...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error loading video: {error}</div>;
    }

    if (!currentVideo) {
        return <div className={styles.error}>Video not found</div>;
    }

    const videoUrl = getFullAssetUrl(currentVideo.file_path);
    const thumbnailUrl = getFullAssetUrl(currentVideo.thumbnail_path);

    return (
        <div className={styles.videoDetailContainer}>
            <div className={styles.videoPlayer}>
                <video
                    src={videoUrl}
                    controls
                    poster={thumbnailUrl}
                    className={styles.videoElement}
                />
            </div>

            <div className={styles.videoInfo}>
                <h1 className={styles.videoTitle}>{currentVideo.title}</h1>

                <div className={styles.videoMetadata}>
                    <div className={styles.userInfo}>
                        Uploaded by: {currentVideo.user?.username || 'Unknown user'}
                    </div>
                    <div className={styles.videoStats}>
                        <span className={styles.uploadDate}>
                            {new Date(currentVideo.upload_date).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <AddToPlaylistButton videoId={video.id} videoOwnerId={video.user_id} />
                    <ShareButton videoId={currentVideo.id} />

                    {isOwner && (
                        <>
                            <button
                                className={styles.editButton}
                                onClick={() => setIsEditModalOpen(true)}
                                style={{
                                    backgroundColor: '#f0f7ff',
                                    color: '#4a90e2',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '8px 16px',
                                    marginRight: '10px',
                                    cursor: 'pointer',
                                    fontWeight: '500',
                                    fontSize: '14px'
                                }}
                            >
                                Edit Video
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => setIsDeleteConfirmOpen(true)}
                            >
                                Delete Video
                            </button>
                        </>
                    )}
                </div>

                <div className={styles.videoDescription}>
                    <h3>Description</h3>
                    <p>{currentVideo.description || 'No description provided.'}</p>
                </div>
            </div>

            {isDeleteConfirmOpen && (
                <div className={styles.deleteConfirmModal}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Delete</h3>
                        <p>Are you sure you want to delete this video? This action cannot be undone.</p>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setIsDeleteConfirmOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmDeleteButton}
                                onClick={handleDelete}
                            >
                                Delete Video
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add the EditVideoModal */}
            {isEditModalOpen && (
                <EditVideoModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    video={currentVideo}
                />
            )}
        </div>
    );
};

export default VideosDetail;