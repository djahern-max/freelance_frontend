import { MessageSquare, Play, ThumbsUp, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import CreateRequestModal from '../requests/CreateRequestModal';
import VideoEmptyState from './VideoEmptyState';
import styles from './VideoList.module.css';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  const [selectedCreator, setSelectedCreator] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // In VideoList.js, modify the fetchVideos function
  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/video_display/');
      console.log('Video API Response:', response); // Add this line
      if (response.data && Array.isArray(response.data.other_videos)) {
        setVideos(response.data.other_videos);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('Video fetch error:', err);
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

  useEffect(() => {
    fetchVideos();
  }, []);

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
    setSelectedVideo({ ...video, streamUrl: video.file_path });
    setShowVideoModal(true);
  };

  const toggleDescription = (videoId) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
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
        {isAuthenticated && (
          <button
            className={styles.uploadVideoButton}
            onClick={() => navigate('/video-upload')}
          >
            <Upload size={16} />
            <span>Upload</span>
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {videos.map((video) => (
          <div key={video.id || Math.random()} className={styles.videoCard}>
            <div
              className={styles.thumbnailContainer}
              onClick={() => handleVideoClick(video)}
            >
              {video.thumbnail_path ? (
                <>
                  <img
                    src={video.thumbnail_path}
                    alt={video.title || 'Video Thumbnail'}
                    className={styles.thumbnail}
                  />
                  <div className={styles.playButton}>
                    <Play size={24} />
                  </div>
                </>
              ) : (
                <div className={styles.thumbnailPlaceholder}>
                  <Play size={32} className={styles.playButton} />
                </div>
              )}
            </div>

            <div className={styles.contentContainer}>
              <h2 className={styles.videoTitle}>
                {video.title || 'Untitled Video'}
              </h2>

              {user?.userType !== 'developer' && (
                <button
                  className={styles.requestButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSendRequest(video);
                  }}
                >
                  <MessageSquare size={16} className={styles.icon} />
                  <span>Send Me a Request</span>
                </button>
              )}

              {video.description && (
                <div className={styles.description}>
                  <p>
                    {expandedDescriptions.has(video.id)
                      ? video.description
                      : `${video.description.substring(0, 100)}${video.description.length > 100 ? '...' : ''
                      }`}
                  </p>
                  {video.description.length > 100 && (
                    <button
                      className={styles.readMoreButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDescription(video.id);
                      }}
                    >
                      {expandedDescriptions.has(video.id)
                        ? 'Show Less'
                        : 'Read More'}
                    </button>
                  )}
                </div>
              )}

              <div className={styles.metadata}>
                <span>{formatDate(video.upload_date)}</span>
                <div className={styles.likeContainer}>
                  <button
                    className={`${styles.likeButton} ${video.liked_by_user ? styles.liked : ''
                      }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(video.id, video.liked_by_user);
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
          </div>
        ))}
      </div>

      {showVideoModal && selectedVideo && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => {
                setShowVideoModal(false);
                setSelectedVideo(null);
              }}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <div className={styles.videoWrapper}>
              <video
                className={styles.modalVideo}
                controls
                autoPlay
                src={selectedVideo.streamUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className={styles.modalInfo}>
              <h2 className={styles.videoTitle}>{selectedVideo.title}</h2>

              <div className={styles.modalMetadata}>
                <span>{formatDate(selectedVideo.upload_date)}</span>
                <div className={styles.likeContainer}>
                  <button
                    className={`${styles.likeButton} ${selectedVideo.liked_by_user ? styles.liked : ''
                      }`}
                    onClick={() =>
                      handleVote(selectedVideo.id, selectedVideo.liked_by_user)
                    }
                  >
                    <ThumbsUp
                      size={16}
                      className={styles.icon}
                      fill={
                        selectedVideo.liked_by_user ? 'currentColor' : 'none'
                      }
                    />
                    <span>{selectedVideo.likes || 0}</span>
                  </button>
                </div>
              </div>

              {selectedVideo.description && (
                <p className={styles.description}>
                  {selectedVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => {
          setShowAuthDialog(false);
          setSelectedVideo(null);
        }}
        onLogin={() =>
          navigate('/login', { state: { from: location.pathname } })
        }
        onRegister={() =>
          navigate('/register', { state: { from: location.pathname } })
        }
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
    </div>
  );
};

export default VideoList;
