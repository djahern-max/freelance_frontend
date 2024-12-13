import { Clock, MessageSquare, Play, ThumbsUp, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import SubscriptionDialog from '../payments/SubscriptionDialog';
import styles from './VideoList.module.css';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
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

  const handleStartConversation = async (video) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (user?.userType !== 'client') {
      try {
        const response = await api.get('/payments/subscription-status');
        if (response.data.status !== 'active') {
          setShowSubscriptionDialog(true);
          return;
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
        return;
      }
    }

    try {
      // Log the video object to check its structure
      console.log('Video data:', video);

      const response = await api.post('/conversations/from-video/', {
        video_id: video.id,
        // Include any other required fields based on your schema
        title: `Discussion about video: ${video.title}`,
        content: `Starting conversation about video "${video.title}"`,
        user_id: user.id,
      });

      if (response.data.id) {
        navigate(`/conversations/${response.data.id}`);
      } else {
        throw new Error('No conversation ID returned');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      console.error('Error creating conversation:', error);
    }
  };

  const renderVideoCard = (video) => (
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
        <h2 className={styles.videoTitle}>{video.title || 'Untitled Video'}</h2>
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
                {expandedDescriptions.has(video.id) ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        )}

        <div className={styles.metadata}>
          <span>{formatDate(video.upload_date)}</span>
          <div className={styles.actionButtons}>
            <button
              className={`${styles.likeButton} ${
                video.liked_by_user ? styles.liked : ''
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

            {user?.userType === 'client' && (
              <button
                className={styles.chatButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartConversation(video);
                }}
              >
                <MessageSquare size={16} />
                <span>Chat</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

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

      <div className={styles.grid}>{videos.map(renderVideoCard)}</div>

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
                    className={`${styles.likeButton} ${
                      selectedVideo.liked_by_user ? styles.liked : ''
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

      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSuccess={() => {
          setShowSubscriptionDialog(false);
          // Retry the conversation creation if needed
        }}
      />
    </div>
  );
};

export default VideoList;
