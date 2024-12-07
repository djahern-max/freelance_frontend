import { Calendar, Clock, Play, Upload, X } from 'lucide-react';
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

  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/video_display'); // Removed trailing slash
      const allVideos = response.data.other_videos || [];
      setVideos(allVideos);
    } catch (err) {
      console.error('Error details:', err);
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
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
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

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
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
                <p className={styles.description}>
                  {video.description.length > 100
                    ? `${video.description.substring(0, 100)}...`
                    : video.description}
                </p>
              )}
              <div className={styles.metadata}>
                <div className={styles.metaItem}>
                  <Calendar size={16} className={styles.icon} />
                  <span>{formatDate(video.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Playback Modal */}
      {showVideoModal && selectedVideo && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeVideoModal}
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
          navigate('/login', {
            state: { from: location.pathname },
          })
        }
        onRegister={() =>
          navigate('/register', {
            state: { from: location.pathname },
          })
        }
      />
    </div>
  );
};

export default VideoList;
