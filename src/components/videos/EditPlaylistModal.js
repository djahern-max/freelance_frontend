// components/videos/EditPlaylistModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../shared/Modal';
import { updatePlaylist } from '../../redux/playlistSlice';
import './EditPlaylistModal.css';  // Use regular CSS import

const EditPlaylistModal = ({ isOpen, onClose, playlist }) => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        is_public: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (playlist) {
            setFormData({
                name: playlist.name || '',
                description: playlist.description || '',
                is_public: playlist.is_public || false
            });
        }
    }, [playlist]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await dispatch(updatePlaylist({
                playlistId: playlist.id,
                playlistData: formData
            })).unwrap();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update playlist');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Playlist">
            <form onSubmit={handleSubmit} className="edit-form">
                {error && <div className="edit-error">{error}</div>}

                <div className="edit-form-group">
                    <label htmlFor="name">Playlist Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="edit-form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                        placeholder="Describe what this playlist is about..."
                    />
                </div>

                <div className="edit-form-group">
                    <label className="edit-checkbox-label">
                        <input
                            type="checkbox"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                        />
                        Public Playlist
                    </label>
                </div>

                <div className="edit-form-actions">
                    <button
                        type="button"
                        className="edit-cancel-button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="edit-submit-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default EditPlaylistModal;