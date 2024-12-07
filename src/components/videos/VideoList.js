import { Calendar, Clock, Play, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AuthDialog from '../auth/AuthDialog';
import styles from './VideoList.module.css';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const token = localStorage.getItem('token');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://www.ryze.ai/api/video_display/'
          : 'http://localhost:8000/video_display/';

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      const allVideos = data.other_videos || [];
      setVideos(allVideos);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    if (!token) {
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

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <button
          className={styles.uploadVideoButton}
          onClick={() => navigate('/video-upload')}
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Clock className={styles.loadingIcon} size={24} />
          <span className={styles.loadingText}>Loading videos...</span>
        </div>
      ) : error ? (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>Error: {error}</p>
        </div>
      ) : !videos || videos.length === 0 ? (
        <div className={styles.emptyState}>
          <Play className={styles.emptyIcon} size={48} />
          <h2 className={styles.emptyTitle}>No Videos Available</h2>
          <p className={styles.emptyText}>
            There are currently no videos to display.
          </p>
        </div>
      ) : (
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
      )}

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
