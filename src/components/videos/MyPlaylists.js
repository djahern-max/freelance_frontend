// src/components/videos/MyPlaylists.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchUserPlaylists, deletePlaylist } from '../../redux/playlistSlice';
import CreatePlaylistModal from './CreatePlaylistModal';
import EditPlaylistModal from './EditPlaylistModal';
import { toast } from 'react-toastify';
import styles from './MyPlaylists.module.css';

const MyPlaylists = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPlaylist, setEditingPlaylist] = useState(null);
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);
    const { userPlaylists, loading } = useSelector(state => state.playlists);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchUserPlaylists(user.id));
        }
    }, [dispatch, user]);

    useEffect(() => {
        // Debug logging to see what's in the playlist data
        console.log('User Playlists:', userPlaylists);
    }, [userPlaylists]);

    const handleCreatePlaylist = () => {
        setShowCreateModal(true);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setEditingPlaylist(null);
    };

    const handleEditPlaylist = (playlist) => {
        setEditingPlaylist(playlist);
    };

    const handleDeletePlaylist = (playlistId) => {
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            dispatch(deletePlaylist(playlistId))
                .unwrap()
                .then(() => {
                    toast.success('Playlist deleted successfully');
                })
                .catch((error) => {
                    toast.error(`Failed to delete playlist: ${error.message || 'Unknown error'}`);
                });
        }
    };

    // Enhanced function to get accurate video count
    const getVideoCount = (playlist) => {
        // First, check for the explicit count from the backend
        if (typeof playlist.video_count === 'number') {
            return playlist.video_count;
        }

        // Fallbacks if video_count isn't available
        if (playlist.videos && Array.isArray(playlist.videos)) {
            return playlist.videos.length;
        }

        if (playlist._count && typeof playlist._count.videos === 'number') {
            return playlist._count.videos;
        }

        return 0;
    };

    return (
        <div className={styles.myPlaylists}>
            <div className={styles.header}>
                <h1>My Playlists</h1>
                <button
                    className={styles.createButton}
                    onClick={handleCreatePlaylist}
                >
                    Create New Playlist
                </button>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading playlists...</div>
            ) : (
                <div className={styles.playlistsContainer}>
                    {!userPlaylists || userPlaylists.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>You don't have any playlists yet.</p>
                            <p>Create your first playlist to start organizing your videos!</p>
                        </div>
                    ) : (
                        <div className={styles.playlistList}>
                            {userPlaylists.map(playlist => {
                                const videoCount = getVideoCount(playlist);

                                return (
                                    <div key={playlist.id} className={styles.playlistCard}>
                                        <div className={styles.cardContent}>
                                            <h3 className={styles.playlistTitle}>
                                                {playlist.name}
                                            </h3>
                                            <p className={styles.description}>
                                                {playlist.description || 'No description'}
                                            </p>
                                            <div className={styles.meta}>
                                                <span className={styles.videoCount}>
                                                    {videoCount} {videoCount === 1 ? 'video' : 'videos'}
                                                </span>
                                                <span className={`${styles.visibility} ${playlist.is_public ? styles.public : styles.private}`}>
                                                    {playlist.is_public ? 'Public' : 'Private'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={styles.cardActions}>
                                            <Link
                                                to={`/playlists/${playlist.id}`}
                                                className={styles.actionButton}
                                            >
                                                View
                                            </Link>
                                            <button
                                                className={`${styles.actionButton} ${styles.editButton}`}
                                                onClick={() => handleEditPlaylist(playlist)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className={`${styles.actionButton} ${styles.deleteButton}`}
                                                onClick={() => handleDeletePlaylist(playlist.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && (
                <CreatePlaylistModal onClose={handleCloseModal} />
            )}

            {editingPlaylist && (
                <EditPlaylistModal
                    isOpen={true}
                    onClose={handleCloseModal}
                    playlist={editingPlaylist}
                />
            )}
        </div>
    );
};

export default MyPlaylists;