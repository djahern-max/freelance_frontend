// components/videos/EditVideoModal.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Modal from '../shared/Modal';
import { updateVideo } from '../../redux/videoSlice';
import './EditVideoModal.css';  // Use regular CSS import

const EditVideoModal = ({ isOpen, onClose, video }) => {
    console.log('EditVideoModal rendering with video:', video);  // Add this debug log

    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        is_public: false,
        video_type: 'solution_demo'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (video) {
            setFormData({
                title: video.title || '',
                description: video.description || '',
                is_public: video.is_public || false,
                video_type: video.video_type || 'solution_demo',
                project_id: video.project_id || null,
                request_id: video.request_id || null
            });
        }
    }, [video]);

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
            await dispatch(updateVideo({
                videoId: video.id,
                videoData: formData
            })).unwrap();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update video');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Video">
            <form onSubmit={handleSubmit} className="edit-form">
                {error && <div className="edit-error">{error}</div>}

                <div className="edit-form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
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
                    />
                </div>

                <div className="edit-form-group">
                    <label htmlFor="video_type">Video Type</label>
                    <select
                        id="video_type"
                        name="video_type"
                        value={formData.video_type}
                        onChange={handleChange}
                    >
                        <option value="solution_demo">Solution Demo</option>
                        <option value="project_overview">Project Overview</option>
                        <option value="progress_update">Progress Update</option>
                    </select>
                </div>

                <div className="edit-form-group">
                    <label className="edit-checkbox-label">
                        <input
                            type="checkbox"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                        />
                        Public Video
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

export default EditVideoModal;