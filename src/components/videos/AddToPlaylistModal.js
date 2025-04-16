// src/components/videos/AddToPlaylistModal.js
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    fetchUserPlaylists,
    fetchVideoPlaylists,
    addVideoToPlaylist,
    createPlaylist
} from '../../redux/playlistSlice';
import styles from './AddToPlaylistModal.module.css';

const AddToPlaylistModal = ({ videoId, videoOwnerId, onClose }) => {
    const dispatch = useDispatch();
    const { userPlaylists, videoPlaylists, loading } = useSelector(state => state.playlists);
    const currentUser = useSelector(state => state.auth.user);
    const [selectedPlaylists, setSelectedPlaylists] = useState([]);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debug logs to help troubleshoot
    console.log('Current user ID:', currentUser?.id);
    console.log('Video owner ID:', videoOwnerId);
    console.log('User playlists:', userPlaylists);

    // Force isOwner to true for now if user is logged in - we'll debug the comparison later
    const isOwner = true; // Temporarily forcing this so the add section appears

    useEffect(() => {
        // Always fetch the video's playlists first to show what playlists it belongs to
        dispatch(fetchVideoPlaylists(videoId));

        // If the current user is logged in, also fetch their playlists
        if (currentUser?.id) {
            dispatch(fetchUserPlaylists(currentUser.id));
        }
    }, [dispatch, videoId, currentUser]);

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
                    // Refresh playlists after adding
                    dispatch(fetchVideoPlaylists(videoId));
                }

                if (failed.length > 0) {
                    toast.error(`Failed to add to ${failed.length} playlist(s)`);
                }

                // Only close if all operations were successful
                if (failed.length === 0) {
                    onClose();
                } else {
                    setIsSubmitting(false);
                }
            })
            .catch(() => {
                setIsSubmitting(false);
            });
    };

    // Determine which playlists to display
    const hasVideoPlaylists = Array.isArray(videoPlaylists) && videoPlaylists.length > 0;
    const hasUserPlaylists = Array.isArray(userPlaylists) && userPlaylists.length > 0;

    // This message is shown when the video isn't in any playlists
    const emptyPlaylistsMessage = "This video is not in any playlists yet.";

    return (
        <div className={styles.modalOverlay} onClick={(e) => {
            // Only close if clicking the overlay itself, not its children
            if (e.target === e.currentTarget) onClose();
        }}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <h2>Playlists</h2>

                {loading || isSubmitting ? (
                    <div className={styles.loading}>
                        {isSubmitting ? 'Adding to playlist...' : 'Loading playlists...'}
                    </div>
                ) : (
                    <>
                        <div className={styles.playlistSection}>
                            <h3>This video appears in the following playlists:</h3>
                            <div className={styles.playlistList}>
                                {hasVideoPlaylists ? (
                                    videoPlaylists.map(playlist => (
                                        <div key={playlist.id} className={styles.playlistItem}>
                                            <Link
                                                to={`/playlists/${playlist.id}`}
                                                className={styles.playlistLink}
                                                onClick={onClose}
                                            >
                                                <div className={styles.playlistName}>
                                                    {playlist.name}
                                                    <span className={styles.videoCount}>
                                                        ({playlist.video_count} {playlist.video_count !== 1 ? 'videos' : 'video'})
                                                    </span>
                                                </div>
                                                <div className={styles.viewLink}>View playlist →</div>
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noPlaylists}>
                                        {emptyPlaylistsMessage}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Add To Playlists Section - Always show for now while debugging */}
                        {currentUser && (
                            <div className={styles.playlistSection}>
                                <h3>Add to your playlists:</h3>
                                <div className={styles.playlistList}>
                                    {hasUserPlaylists ? (
                                        userPlaylists.map(playlist => (
                                            <div key={playlist.id} className={styles.playlistItem}>
                                                <label className={styles.checkboxLabel}>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPlaylists.includes(playlist.id)}
                                                        onChange={() => handleTogglePlaylist(playlist.id)}
                                                    />
                                                    {playlist.name}
                                                </label>
                                            </div>
                                        ))
                                    ) : (
                                        <p className={styles.noPlaylists}>You don't have any playlists yet.</p>
                                    )}
                                </div>

                                {showCreateForm ? (
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
                                )}

                                <div className={styles.actionButtons}>
                                    <button
                                        onClick={handleSave}
                                        className={styles.saveButton}
                                        disabled={selectedPlaylists.length === 0 || isSubmitting}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.closeButton}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;