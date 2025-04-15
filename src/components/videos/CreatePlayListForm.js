// src/components/videos/CreatePlaylistForm.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createPlaylist } from '../../redux/playlistSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './CreatePlaylistForm.module.css';

const CreatePlaylistForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(true);
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error('Please enter a playlist name');
            return;
        }

        setLoading(true);

        dispatch(createPlaylist({
            name: name.trim(),
            description: description.trim(),
            is_public: isPublic
        }))
            .unwrap()
            .then((playlist) => {
                toast.success('Playlist created successfully');
                navigate(`/playlists/${playlist.id}`);
            })
            .catch((error) => {
                console.error('Failed to create playlist:', error);
                toast.error('Failed to create playlist');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className={styles.createPlaylistForm}>
            <h1>Create New Playlist</h1>

            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Playlist Name *</label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter playlist name"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="description">Description (optional)</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter playlist description"
                        rows={4}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                        <input
                            type="checkbox"
                            checked={isPublic}
                            onChange={(e) => setIsPublic(e.target.checked)}
                        />
                        <span>Make this playlist public</span>
                    </label>
                </div>

                <div className={styles.formActions}>
                    <button
                        type="button"
                        className={styles.cancelButton}
                        onClick={() => navigate('/playlists')}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles.submitButton}
                        disabled={loading || !name.trim()}
                    >
                        {loading ? 'Creating...' : 'Create Playlist'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePlaylistForm;