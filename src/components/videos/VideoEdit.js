// components/videos/VideoEdit.js
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import FormModalWrapper from '../shared/FormModalWrapper';
import { updateVideo } from '../../redux/videoSlice';
import styles from './VideoEdit.module.css';

const VideoEdit = ({ isOpen, onClose, video }) => {
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
            // Force boolean conversion for is_public
            setFormData({
                title: video.title || '',
                description: video.description || '',
                is_public: Boolean(video.is_public),
                video_type: video.video_type || 'solution_demo',
                project_id: video.project_id || null,
                request_id: video.request_id || null
            });
            console.log("Video data loaded:", {
                is_public: Boolean(video.is_public),
                video_type: video.video_type || 'solution_demo'
            });
        }
    }, [video]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // Debug the change
        console.log(`Field changed: ${name}, value: ${type === 'checkbox' ? checked : value}`);

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
        <FormModalWrapper isOpen={isOpen} onClose={onClose} title="Edit Video">
            <form onSubmit={handleSubmit} className={styles['edit-form']}>
                {error && <div className={styles['edit-error']}>{error}</div>}

                <div className={styles['edit-form-group']}>
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

                <div className={styles['edit-form-group']}>
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={5}
                    />
                </div>

                <div className={styles['edit-form-group']}>
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
                        <option value="pitch_contest">Pitch Contest</option>
                        <option value="tutorials">Tutorials</option>
                    </select>
                </div>
                <div className={styles['edit-form-group']}>
                    <label className={styles['edit-checkbox-label']}>
                        <input
                            type="checkbox"
                            id="is_public"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                        />
                        Public Video
                    </label>
                    <p className={styles['privacy-hint']}>
                        {formData.is_public
                            ? "This video will be visible to anyone with the link"
                            : "This video will only be visible to you"}
                    </p>
                </div>

                <div className={styles['edit-form-actions']}>
                    <button
                        type="button"
                        className={styles['edit-cancel-button']}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className={styles['edit-submit-button']}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </FormModalWrapper>
    );
};

export default VideoEdit;