import { MessageSquare, Play, ThumbsUp, Upload, X, List, Plus, Trash2, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AuthDialog from '../auth/AuthDialog';
import CreateRequestModal from '../requests/CreateRequestModal';
import VideoEmptyState from './VideoEmptyState';
import styles from './VideoList.module.css';
import ShareButton from './ShareButton';
import Modal from '../shared/Modal';
import api from '../../utils/api';
import { fetchUserPlaylists, addVideoToPlaylist, createPlaylist } from '../../redux/playlistSlice';
import { getFullAssetUrl } from '../../utils/videoUtils';
import AddToPlaylistModal from './AddToPlaylistModal';
import DescriptionModal from './DescriptionModal';
import EditVideoModal from './EditVideoModal'; // Import the EditVideoModal component



const VideoItem = ({
  video,
  onVideoClick,
  isAuthenticated,
  onVote,
  onSendRequest,
  onAddToPlaylist,
  onDeleteVideo,
  onEditVideo, // Add this prop
  user,
  formatDate
}) => {
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const isOwner = user?.id === video.user_id;

  return (
    <div className={styles.videoCard}>
      <div
        className={styles.thumbnailContainer}
        onClick={() => onVideoClick(video)}
      >
        {video.thumbnail_path ? (
          <>
            <img
              src={getFullAssetUrl(video.thumbnail_path)}
              alt={video.title || 'Video Thumbnail'}
              className={styles.thumbnail}
            />
            <div className={styles.playButton}>
              <Play size={24} />
            </div>
          </>
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <Play size={32} className={styles.playButtonIcon} />
          </div>
        )}
      </div>

      <div className={styles.contentContainer}>
        <h2 className={styles.videoTitle}>
          {video.title || 'Untitled Video'}
        </h2>

        {/* In your VideoItem component */}
        <div className={styles.actionButtons}>
          {user?.userType !== 'developer' && (
            <button
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                onSendRequest(video);
              }}
            >
              <MessageSquare size={16} className={styles.icon} />
              <span>Request</span>
            </button>
          )}

          <ShareButton
            videoId={video?.id}
            projectUrl={video?.project_url}
          />

          {isAuthenticated && (
            <button
              className={styles.actionButton}
              onClick={(e) => {
                e.stopPropagation();
                onAddToPlaylist(video);
              }}
            >
              <List size={16} className={styles.icon} />
              <span>Playlist</span>
            </button>
          )}

          {isOwner && (
            <>
              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditVideo(video); // Use the passed handler
                }}
              >
                <Edit size={16} className={styles.icon} />
                <span>Edit</span>
              </button>

              <button
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this video?')) {
                    onDeleteVideo(video.id);
                  }
                }}
              >
                <Trash2 size={16} className={styles.icon} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>

        {video.description && (
          <div className={styles.description}>
            <p>
              {video.description.substring(0, 100)}
              {video.description.length > 100 ? '...' : ''}
            </p>
            {video.description.length > 100 && (
              <button
                className={styles.readMoreButton}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDescriptionModalOpen(true);
                }}
              >
                Read More
              </button>
            )}
          </div>
        )}

        <div className={styles.metadata}>
          <span>{formatDate(video.upload_date)}</span>
          <div className={styles.likeContainer}>
            <button
              className={`${styles.likeButton} ${video.liked_by_user ? styles.liked : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onVote(video.id, video.liked_by_user);
              }}
            >
              <ThumbsUp
                size={16}
                className={styles.icon}
                fill={video.liked_by_user ? 'currentColor' : 'none'}
              />
              <span>{video.likes}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Using the new portal-based modal component */}
      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        title={video.title}
        description={video.description}
      />

    </div>
  );

};



const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedVideoForPlaylist, setSelectedVideoForPlaylist] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [editingVideo, setEditingVideo] = useState(null);

  const handleEditVideo = (video) => {
    setEditingVideo(video);
  };

  // MOVE THESE FUNCTIONS HERE - Outside of any other component
  const deleteVideo = async (videoId) => {
    try {
      await api.delete(`/videos/${videoId}`);
      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  };

  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteVideo(videoId);
      // Update the videos list after deletion
      setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast.error('Failed to delete video');
    }
  };

  // In VideoList.js, modify the fetchVideos function
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/video_display/');

      // Only process the response if the component is still mounted
      if (response.data && Array.isArray(response.data.other_videos)) {
        setVideos(response.data.other_videos);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Video fetch error:', err);

      // Skip error handling for cancelled requests
      if (err.message === 'REQUEST_CANCELLED') {
        console.log('Request was cancelled, likely due to component unmount');
        return;
      }

      // Don't treat 401 as an error for public routes
      if (err.response?.status === 401) {
        setVideos([]);
      } else {
        setError(
          "We're having trouble loading the videos. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Add this function inside the VideoList component
  const sortVideosByPlaylist = async (videoArray) => {
    try {
      // First, get playlist details for playlist ID 1
      const playlistResponse = await api.playlists.getPlaylistDetails(1);

      // If no playlist exists, return videos as is
      if (!playlistResponse) {
        console.log('Playlist #1 not found, returning unsorted videos');
        return videoArray;
      }

      if (!playlistResponse.videos || !Array.isArray(playlistResponse.videos)) {
        // If playlist has no videos, return videos as is
        return videoArray;
      }

      // Create a mapping of video IDs to their order in the playlist
      const videoOrderMap = new Map();

      playlistResponse.videos.forEach((video, index) => {
        // Use the order property if available, otherwise use the index
        const order = video.order !== undefined ? video.order : index;
        videoOrderMap.set(video.id, order);
      });

      // Sort the videos based on their order in playlists
      const sortedVideos = [...videoArray].sort((a, b) => {
        const orderA = videoOrderMap.has(a.id) ? videoOrderMap.get(a.id) : 999999;
        const orderB = videoOrderMap.has(b.id) ? videoOrderMap.get(b.id) : 999999;
        return orderA - orderB;
      });

      return sortedVideos;
    } catch (error) {
      console.log('Returning unsorted videos due to playlist error');
      return videoArray;
    }
  };

  useEffect(() => {
    // Flag to track if component is still mounted
    let isMounted = true;

    const loadVideos = async () => {
      try {
        if (!isMounted) return;

        setLoading(true);
        setError(null);

        // Always use trailing slash to prevent 307 redirects
        const response = await api.get('/video_display/');

        if (!isMounted) return;

        if (response.data && Array.isArray(response.data.other_videos)) {
          // Sort the videos by playlist order before setting them
          const sortedVideos = await sortVideosByPlaylist(response.data.other_videos);
          setVideos(sortedVideos);
        } else {
          setVideos([]);
        }
      } catch (err) {
        if (!isMounted) return;

        // Ignore cancelled requests
        if (err.message === 'REQUEST_CANCELLED') {
          console.log('Video request was cancelled');
          return;
        }

        console.error('Video fetch error:', err);

        // Handle 401 for public routes
        if (err.response?.status === 401) {
          setVideos([]);
        } else {
          setError("We're having trouble loading the videos. Please try again later.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Load videos once
    loadVideos();

    // Return cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array means this runs only once on mount

  // Separate useEffect for playlist loading to avoid excessive requests
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchUserPlaylists(user.id));
    }
  }, [isAuthenticated, user, dispatch]);


  const formatDate = (dateString) => {
    try {
      if (!dateString) {
        return 'Date unavailable';
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Date unavailable';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Date unavailable';
    }
  };

  const handleVote = async (videoId, currentlyLiked) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    try {
      // Optimistically update the UI
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? {
              ...video,
              likes: currentlyLiked ? video.likes - 1 : video.likes + 1,
              liked_by_user: !currentlyLiked,
            }
            : video
        )
      );

      // Make API call - note the endpoint is just '/vote'
      const response = await api.post('/vote', {
        video_id: videoId,
        dir: currentlyLiked ? 0 : 1,
      });

      if (!response.data) {
        throw new Error('Failed to update vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Revert the optimistic update
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? {
              ...video,
              likes: currentlyLiked ? video.likes + 1 : video.likes - 1,
              liked_by_user: currentlyLiked,
            }
            : video
        )
      );
    }
  };

  const handleSendRequest = (video) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (user?.userType === 'developer') {
      toast.info('As a creator, you cannot send requests to other creators.');
      return;
    }

    setSelectedCreator({
      id: video.user_id,
      username:
        video.user?.full_name ||
        video.user?.username ||
        `Creator #${video.user_id}`,
      videoId: video.id,
    });
  };

  const handleAddToPlaylist = (video) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    setSelectedVideoForPlaylist(video);
    setShowPlaylistModal(true);
  };

  const handleRequestSent = (creatorUsername) => {
    toast.success(
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Request Sent Successfully
        </span>
        <span>
          Your request has been shared with {creatorUsername}. They will be
          notified and can review it shortly.
        </span>
      </div>,
      {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
    setSelectedCreator(null);
  };

  const handleVideoClick = (video) => {
    if (!isAuthenticated) {
      setSelectedVideo(video);
      setShowAuthDialog(true);
      return;
    }
    if (!video || !video.file_path) {
      console.error('Invalid video data:', video);
      return;
    }
    setSelectedVideo({
      ...video,
      streamUrl: getFullAssetUrl(video.file_path)
    });
    setShowVideoModal(true);
  };

  // Your existing empty state check
  if (error || !videos || videos.length === 0) {
    return (
      <div className={styles.container}>
        <VideoEmptyState
          isAuthenticated={isAuthenticated}
          userType={user?.userType}
          onCreateVideo={() => navigate('/video-upload')}
          onSignUp={() => setShowAuthDialog(true)}
          error={error}
          onRetry={fetchVideos}
          isEmpty={!error && (!videos || videos.length === 0)}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <div className={styles.headerActions}>
          {isAuthenticated && (
            <>
              <button
                className={styles.uploadVideoButton}
                onClick={() => navigate('/video-upload')}
              >
                <Upload size={16} />
                <span>Upload</span>
              </button>

              <button
                className={styles.playlistsButton}
                onClick={() => navigate('/playlists')}
              >
                <List size={16} />
                <span>My Playlists</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        {videos.map((video) => (
          <VideoItem
            key={video.id}
            video={video}
            onVideoClick={handleVideoClick}
            isAuthenticated={isAuthenticated}
            onVote={handleVote}
            onSendRequest={handleSendRequest}
            onAddToPlaylist={handleAddToPlaylist}
            onDeleteVideo={handleDeleteVideo}
            onEditVideo={handleEditVideo} // Pass the handler here
            user={user}
            formatDate={formatDate}
          />
        ))}
      </div>


      {showVideoModal && selectedVideo && (
        <Modal
          isOpen={showVideoModal}
          onClose={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
          title={selectedVideo.title || 'Video Preview'}
        >
          <div className={styles.videoWrapper}>
            <video
              className={styles.modalVideo}
              controls
              autoPlay
              src={selectedVideo.streamUrl}
            >
              Your browser does not support the video tag.
            </video>
            {/* Improved video info section */}
            <div className={styles.modalInfo}>
              <h2 className={styles.videoTitle}>{selectedVideo.title}</h2>
              {selectedVideo.description && (
                <div className={styles.modalDescription}>
                  {selectedVideo.description}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => {
          setShowAuthDialog(false);
          setSelectedVideo(null);
        }}
        onLogin={() => navigate('/login', { state: { from: location.pathname } })}
        onRegister={() => navigate('/register', { state: { from: location.pathname } })}
      />

      {selectedCreator && (
        <CreateRequestModal
          onClose={() => setSelectedCreator(null)}
          onSubmit={async (formData) => {
            try {
              await api.post('/requests/', {
                ...formData,
                developer_id: selectedCreator.id,
                video_id: selectedCreator.videoId,
              });
              handleRequestSent(selectedCreator.username);
            } catch (error) {
              toast.error('Failed to send request');
              console.error('Request error:', error);
            }
          }}
        />
      )}

      {showPlaylistModal && selectedVideoForPlaylist && (
        <AddToPlaylistModal
          videoId={selectedVideoForPlaylist.id}
          onClose={() => {
            setShowPlaylistModal(false);
            setSelectedVideoForPlaylist(null);
          }}
        />
      )}
      {editingVideo && (
        <EditVideoModal
          isOpen={true}
          onClose={() => setEditingVideo(null)}
          video={editingVideo}
        />
      )}
    </div>
  );
};



export default VideoList;