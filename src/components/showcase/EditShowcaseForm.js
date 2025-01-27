import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShowcase, updateShowcase, updateShowcaseFiles } from '../../redux/showcaseSlice';
import ShowcaseForm from './ShowcaseForm';
import api from '../../utils/api';
import styles from './EditShowcaseForm.module.css';

const EditShowcaseForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { currentShowcase, loading, error } = useSelector((state) => state.showcase);
    const { user } = useSelector((state) => state.auth);
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [userVideos, setUserVideos] = useState([]);
    const [developerProfile, setDeveloperProfile] = useState(null);

    useEffect(() => {
        const loadShowcaseAndRelatedData = async () => {
            try {
                // Load showcase
                const result = await dispatch(fetchShowcase(id)).unwrap();

                // Load user's videos
                const videosResponse = await api.get('/video_display/my-videos');
                setUserVideos(videosResponse.data);

                // Load developer profile
                const profileResponse = await api.get('/profile/developer');
                setDeveloperProfile(profileResponse.data);

                setLoadingInitial(false);

                // Check if the current user is the owner
                if (!user || result.developer_id !== user.id) {
                    navigate('/showcase', {
                        replace: true,
                        state: { error: 'You do not have permission to edit this showcase' }
                    });
                }
            } catch (err) {
                console.error('Error loading showcase:', err);
                navigate('/showcase', {
                    replace: true,
                    state: { error: 'Failed to load showcase for editing' }
                });
            }
        };

        loadShowcaseAndRelatedData();
    }, [dispatch, id, navigate, user]);

    const handleUpdate = async (formData) => {
        try {
            // Update basic showcase information
            await dispatch(updateShowcase({
                id,
                data: {
                    title: formData.title,
                    description: formData.description,
                    project_url: formData.project_url,
                    repository_url: formData.repository_url,
                    demo_url: formData.demo_url
                }
            })).unwrap();

            // Update files if provided
            if (formData.image_file || formData.readme_file) {
                const filesFormData = new FormData();
                if (formData.image_file) {
                    filesFormData.append('image_file', formData.image_file);
                }
                if (formData.readme_file) {
                    filesFormData.append('readme_file', formData.readme_file);
                }
                await dispatch(updateShowcaseFiles({ id, data: filesFormData })).unwrap();
            }

            // Update video links
            if (formData.selectedVideos?.length > 0) {
                await api.put(`/project-showcase/${id}/videos`, {
                    video_ids: formData.selectedVideos
                });
            }

            // Update profile link
            if (formData.includeProfile) {
                await api.put(`/project-showcase/${id}/profile`);
            }

            navigate('/showcase');
        } catch (error) {
            console.error('Error updating showcase:', error);
            throw error;
        }
    };

    if (loadingInitial || loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                Loading showcase...
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Error Loading Showcase</h2>
                <p>{error}</p>
                <button
                    onClick={() => navigate('/showcase')}
                    className={styles.backButton}
                >
                    Back to Showcases
                </button>
            </div>
        );
    }

    if (!currentShowcase) {
        return (
            <div className={styles.notFound}>
                <h2>Showcase Not Found</h2>
                <p>The showcase you're trying to edit doesn't exist or has been removed.</p>
                <button
                    onClick={() => navigate('/showcase')}
                    className={styles.backButton}
                >
                    Back to Showcases
                </button>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Edit Showcase</h1>
                    <button
                        onClick={() => navigate('/showcase')}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </div>

                <ShowcaseForm
                    isEditing={true}
                    initialData={currentShowcase}
                    onSubmit={handleUpdate}
                    availableVideos={userVideos}
                    developerProfile={developerProfile}
                />
            </div>
        </div>
    );
};

export default EditShowcaseForm;