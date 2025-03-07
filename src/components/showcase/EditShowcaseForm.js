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
    const [selectedVideos, setSelectedVideos] = useState([]);
    const [includeProfile, setIncludeProfile] = useState(false);

    useEffect(() => {
        const loadShowcaseAndRelatedData = async () => {
            // Create an AbortController for handling request cancellation
            const controller = new AbortController();
            const signal = controller.signal;

            try {
                // Load showcase
                const result = await dispatch(fetchShowcase(id)).unwrap();
                console.log('Showcase loaded successfully:', result);

                // Load user's videos with detailed logging
                console.log('Attempting to fetch videos...');
                try {
                    // Pass the signal to the request
                    const videosResponse = await api.get('/video_display/my-videos', {
                        signal: signal
                    });

                    console.log('Videos API response status:', videosResponse.status);
                    console.log('Videos data:', videosResponse.data);

                    // Combine both user_videos and other_videos
                    if (videosResponse.data) {
                        const userVideos = videosResponse.data.user_videos || [];
                        const otherVideos = videosResponse.data.other_videos || [];
                        const allVideos = [...userVideos, ...otherVideos];
                        console.log(`Combined videos: ${allVideos.length} total videos`);
                        setUserVideos(allVideos);
                    } else {
                        console.warn('Videos response is empty');
                        setUserVideos([]);
                    }
                } catch (videoErr) {
                    // Don't log errors if the request was canceled intentionally
                    if (videoErr.name !== 'AbortError' && videoErr.name !== 'CanceledError') {
                        console.error('Error fetching videos:', videoErr);
                    }
                    setUserVideos([]);
                }

                // Set initial selected videos from showcase
                if (result.videos && result.videos.length > 0) {
                    console.log('Setting selected videos from showcase:', result.videos);
                    setSelectedVideos(result.videos.map(video => video.id));
                }
            } catch (err) {
                // Don't handle navigation if the error is due to cancellation
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    console.error('Error loading showcase:', err);
                    // Add detailed error logging
                    if (err.response) {
                        console.error('Error status:', err.response.status);
                        console.error('Error data:', err.response.data);
                    }
                    navigate('/showcase', {
                        replace: true,
                        state: { error: 'Failed to load showcase for editing' }
                    });
                }
            } finally {
                // Always set loading to false, even if there were errors
                console.log('Setting loadingInitial to false');
                setLoadingInitial(false);
            }

            // Cleanup function to abort any in-flight requests when component unmounts
            return () => {
                controller.abort();
            };
        };

        loadShowcaseAndRelatedData();
    }, [dispatch, id, navigate, user]);

    // Add this function before handleUpdate
    // Add this function before handleUpdate
    const handleLinkVideo = async (videoId) => {
        try {
            console.log(`Linking video ${videoId} to showcase ${id}`);

            // Call the API directly
            await api.showcase.linkVideo(id, videoId);

            // Update selected videos state
            setSelectedVideos(prev => {
                if (prev.includes(videoId)) {
                    return prev; // Already selected
                }
                return [...prev, videoId];
            });

            console.log('Video linked successfully');
        } catch (error) {
            console.error('Error linking video:', error);
            if (error.response) {
                console.error('Error details:', error.response.data);
            }
        }
    };

    // Update handleUpdate to skip the bulk video update
    const handleUpdate = async (formData) => {
        try {
            // Check if demo_url is a shared video URL
            if (formData.demo_url && formData.demo_url.includes('/shared/videos/')) {
                const shareToken = formData.demo_url.split('/').pop();
                const matchingVideo = userVideos.find(v => v.share_token === shareToken);
                if (matchingVideo && !formData.selectedVideos.includes(matchingVideo.id)) {
                    formData.selectedVideos.push(matchingVideo.id);
                }
            }

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

            // Skip bulk video update since we're handling videos individually
            console.log('Videos are managed individually through the UI');

            // Update profile link
            await api.put(`/project-showcase/${id}/profile`, {
                include_profile: formData.includeProfile
            });

            navigate('/showcase');
        } catch (error) {
            console.error('Error updating showcase:', error);
            throw error;
        }
    };

    if (loadingInitial || loading) {
        return <div className={styles.loading}>Loading showcase...</div>;
    }

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Error Loading Showcase</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/showcase')}>
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

                {/* Log the data to ensure it's available */}
                {console.log('Rendering with videos:', userVideos)}
                {console.log('Selected videos:', selectedVideos)}

                <ShowcaseForm
                    isEditing={true}
                    initialData={{
                        ...currentShowcase,
                        selectedVideos,
                        includeProfile
                    }}
                    onSubmit={handleUpdate}
                    onLinkVideo={handleLinkVideo} // Add this line
                    availableVideos={userVideos || []} // Ensure this is never undefined
                    developerProfile={developerProfile}
                />
            </div>
        </div>
    );
}

export default EditShowcaseForm;