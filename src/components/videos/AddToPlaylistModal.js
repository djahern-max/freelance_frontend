// src/components/videos/AddToPlaylistModal.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
    fetchUserPlaylists,
    fetchVideoPlaylists,
    addVideoToPlaylist,
    createPlaylist
} from '../../redux/playlistSlice';
import styles from './AddToPlaylistModal.module.css';

const AddToPlaylistModal = ({ videoId, videoOwnerId, isOwner, onClose }) => {
    const dispatch = useDispatch();
    const { userPlaylists, videoPlaylists, loading } = useSelector(state => state.playlists);
    const currentUser = useSelector(state => state.auth.user);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mode, setMode] = useState(isOwner ? 'view' : 'add');

    useEffect(() => {
        // If current user is the video owner or viewing mode is active, fetch video playlists
        if (isOwner || mode === 'view') {
            dispatch(fetchVideoPlaylists(videoId));
        }

        // If in add mode and we have a current user, fetch their playlists
        if (mode === 'add' && currentUser?.id) {
            dispatch(fetchUserPlaylists(currentUser.id));
        }
    }, [dispatch, videoId, currentUser, isOwner, mode]);

    const handleTogglePlaylist = (playlistId) => {
        if (selectedPlaylists.includes(playlistId)) {
            setSelectedPlaylists(selectedPlaylists.filter(id => id !== playlistId));
        } else {
            setSelectedPlaylists([...selectedPlaylists, playlistId]);
        }
    };

    const handleCreatePlaylist = () => {
        if (newPlaylistName.trim()) {
            dispatch(createPlaylist({
                name: newPlaylistName.trim(),
                description: '',
                is_public: true
            }))
                .unwrap()
                .then((newPlaylist) => {
                    setSelectedPlaylists([...selectedPlaylists, newPlaylist.id]);
                    setNewPlaylistName('');
                    setShowCreateForm(false);
                })
                .catch(error => {
                    console.error('Error creating playlist:', error);
                    toast.error('Failed to create playlist: ' + (error.message || 'Unknown error'));
                });
        }
    };

    const handleSave = () => {
        setIsSubmitting(true);

        // Create an array of promises for each selected playlist
        const addPromises = selectedPlaylists.map(playlistId => {
            console.log(`Adding video ${videoId} to playlist ${playlistId}`);
            return dispatch(addVideoToPlaylist({ playlistId, videoId }))
                .unwrap()
                .then(result => {
                    console.log(`Successfully added to playlist ${playlistId}:`, result);
                    return { success: true, playlistId };
                })
                .catch(error => {
                    console.error(`Failed to add to playlist ${playlistId}:`, error);
                    return { success: false, playlistId, error };
                });
        });

        // Wait for all promises to resolve
        Promise.all(addPromises)
            .then(results => {
                const successful = results.filter(r => r.success);
                const failed = results.filter(r => !r.success);

                if (successful.length > 0) {
                    toast.success(`Added to ${successful.length} playlist(s)`);
                }

                if (failed.length > 0) {
                    toast.error(`Failed to add to ${failed.length} playlist(s)`);
                }

                onClose();
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Determine which playlists to display based on the mode
    const displayPlaylists = mode === 'view' ? videoPlaylists : userPlaylists;
    const hasPlaylists = Array.isArray(displayPlaylists) && displayPlaylists.length > 0;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal}>
                <h2>{isOwner ? "Manage Playlists" : "Add to Playlist"}</h2>

                {isOwner && (
                    <div className={styles.tabs}>
                        <button
                            className={`${styles.tabButton} ${mode === 'view' ? styles.activeTab : ''}`}
                            onClick={() => setMode('view')}
                        >
                            View In Playlists
                        </button>
                        <button
                            className={`${styles.tabButton} ${mode === 'add' ? styles.activeTab : ''}`}
                            onClick={() => setMode('add')}
                        >
                            Add To Playlist
                        </button>
                    </div>
                )}

                {loading || isSubmitting ? (
                    <div className={styles.loading}>
                        {isSubmitting ? 'Adding to playlist...' : 'Loading playlists...'}
                    </div>
                ) : (
                    <>
                        <div className={styles.playlistList}>
                            {hasPlaylists ? (
                                displayPlaylists.map(playlist => (
                                    <div key={playlist.id} className={styles.playlistItem}>
                                        {mode === 'add' ? (
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPlaylists.includes(playlist.id)}
                                                    onChange={() => handleTogglePlaylist(playlist.id)}
                                                />
                                                {playlist.name}
                                            </label>
                                        ) : (
                                            <div className={styles.playlistName}>
                                                {playlist.name}
                                                <span className={styles.videoCount}>
                                                    {playlist.video_count} video{playlist.video_count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className={styles.noPlaylists}>
                                    {mode === 'view'
                                        ? "This video is not in any playlists yet."
                                        : "You don't have any playlists yet."}
                                </p>
                            )}
                        </div>

                        {mode === 'add' && (
                            showCreateForm ? (
                                <div className={styles.createForm}>
                                    <input
                                        type="text"
                                        value={newPlaylistName}
                                        onChange={(e) => setNewPlaylistName(e.target.value)}
                                        placeholder="Enter playlist name"
                                        className={styles.playlistNameInput}
                                    />
                                    <div className={styles.createFormActions}>
                                        <button
                                            onClick={() => setShowCreateForm(false)}
                                            className={styles.cancelButton}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreatePlaylist}
                                            className={styles.createButton}
                                            disabled={!newPlaylistName.trim()}
                                        >
                                            Create
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowCreateForm(true)}
                                    className={styles.newPlaylistButton}
                                >
                                    + Create New Playlist
                                </button>
                            )
                        )}
                    </>
                )}

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.cancelButton}>
                        {mode === 'view' ? 'Close' : 'Cancel'}
                    </button>
                    {mode === 'add' && (
                        <button
                            onClick={handleSave}
                            className={styles.saveButton}
                            disabled={selectedPlaylists.length === 0 || isSubmitting}
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;