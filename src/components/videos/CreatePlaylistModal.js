// src/components/videos/CreatePlaylistModal.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPlaylist } from '../../redux/playlistSlice';
import { toast } from 'react-toastify';
import styles from './CreatePlaylistModal.module.css';

const CreatePlaylistModal = ({ onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a playlist name');
            return;
        }

        setIsSubmitting(true);

        dispatch(createPlaylist({
            name: name.trim(),
            description: description.trim(),
            is_public: isPublic
        }))
            .unwrap()
            .then(() => {
                toast.success('Playlist created successfully');
                onClose();
            })
            .catch(error => {
                console.error('Failed to create playlist:', error);
                toast.error(`Failed to create playlist: ${error.message || 'Unknown error'}`);
                setIsSubmitting(false);
            });
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>Create New Playlist</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name">Playlist Name *</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            placeholder="Enter playlist name"
                            className={styles.inputField}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Add a description (optional)"
                            className={styles.textareaField}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                                disabled={isSubmitting}
                            />
                            <span>Make this playlist public</span>
                        </label>
                        <p className={styles.helperText}>
                            Public playlists can be viewed by anyone.
                        </p>
                    </div>

                    <div className={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            className={styles.cancelButton}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={styles.submitButton}
                            disabled={isSubmitting || !name.trim()}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Playlist'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;