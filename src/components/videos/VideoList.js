import { Calendar, Clock, Play, ThumbsUp, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
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

  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/video_display/');
      const allVideos = response.data.other_videos || [];
      setVideos(allVideos);
    } catch (err) {
      const errorMessage =
        err.code === 'ERR_NETWORK'
          ? 'Unable to connect to server. Please check your connection and try again.'
          : err.response?.data?.detail || 'Failed to fetch videos.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const formatDate = (dateString) => {
    try {
      // First check if we have a valid date string
      if (!dateString) {
        return 'Date unavailable';
      }

      // Check if date is in timestamp format
      const date =
        typeof dateString === 'number'
          ? new Date(dateString * 1000)
          : new Date(dateString);

      // Validate if date is valid
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

  const handleVote = async (videoId, direction) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    try {
      // Optimistically update UI
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                likes:
                  direction === 1
                    ? (video.likes || 0) + 1
                    : (video.likes || 0) - 1,
                liked: direction === 1,
              }
            : video
        )
      );

      // Make API call
      const response = await api.post('/vote', {
        video_id: videoId, // Changed from post_id to video_id
        dir: direction,
      });

      if (!response.data) {
        // Revert changes if API call fails
        setVideos((prevVideos) =>
          prevVideos.map((video) =>
            video.id === videoId
              ? {
                  ...video,
                  likes:
                    direction === 0
                      ? (video.likes || 0) + 1
                      : (video.likes || 0) - 1,
                  liked: direction === 0,
                }
              : video
          )
        );
      }
    } catch (error) {
      console.error('Error voting:', error);
      // Show error message to user
      alert('Failed to update like status. Please try again.');
      // Revert changes
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video.id === videoId
            ? {
                ...video,
                likes:
                  direction === 0
                    ? (video.likes || 0) + 1
                    : (video.likes || 0) - 1,
                liked: direction === 0,
              }
            : video
        )
      );
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <Clock className={styles.loadingIcon} size={24} />
          <span className={styles.loadingText}>Loading videos...</span>
        </div>
      </div>
    );
  }

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
              {video.description && (
                <div className={styles.description}>
                  <p>
                    {expandedDescriptions.has(video.id)
                      ? video.description
                      : `${video.description.substring(0, 100)}${
                          video.description.length > 100 ? '...' : ''
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
                <div className={styles.metaItem}>
                  <Calendar size={16} className={styles.icon} />
                  <span>
                    {formatDate(video.upload_date || video.created_at)}
                  </span>
                </div>
                <div className={styles.likeContainer}>
                  <button
                    className={`${styles.likeButton} ${
                      video.liked ? styles.liked : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(video.id, video.liked ? 0 : 1);
                    }}
                  >
                    <ThumbsUp size={16} className={styles.icon} />
                    <span>{video.likes || 0}</span>
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
                <span>
                  {formatDate(
                    selectedVideo.upload_date || selectedVideo.created_at
                  )}
                </span>
                <div className={styles.likeContainer}>
                  <button
                    className={`${styles.likeButton} ${
                      selectedVideo.liked ? styles.liked : ''
                    }`}
                    onClick={() =>
                      handleVote(selectedVideo.id, selectedVideo.liked ? 0 : 1)
                    }
                  >
                    <ThumbsUp size={16} className={styles.icon} />
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
    </div>
  );
};

export default VideoList;
