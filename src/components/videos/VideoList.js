import { Calendar, Clock, Play, Upload, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Add useNavigate here
import AuthDialog from '../auth/AuthDialog';
import styles from './VideoList.module.css';

const VideoList = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
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

      // Remove auth header for public access
      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();

      // Just use the other_videos array since we're not authenticating
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="animate-spin mr-2">
          <Clock size={24} />
        </div>
        Loading videos...
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>Error: {error}</p>
      </div>
    );
  }

  // Add check for empty videos array
  if (!videos || videos.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Videos</h1>
          <Link to="/video-upload" className={styles.uploadButton}>
            <Upload size={20} />
            Upload Video
          </Link>
        </div>
        <div className={styles.emptyState}>No videos available</div>
      </div>
    );
  }

  const handleVideoClick = (video) => {
    if (!token) {
      setSelectedVideo(video);
      setShowAuthDialog(true);
      return;
    }
    setSelectedVideo(video);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Videos</h1>
        {token && (
          <Link to="/video-upload" className={styles.uploadButton}>
            <Upload size={20} />
            Upload Video
          </Link>
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
                <img
                  src={video.thumbnail_path}
                  alt={video.title}
                  className={styles.thumbnail}
                />
              ) : (
                <div className={styles.thumbnail} />
              )}
              <div className={styles.playButton}>
                <Play size={24} />
              </div>
            </div>

            <div className={styles.contentContainer}>
              <h2 className={styles.videoTitle}>{video.title || 'Untitled'}</h2>
              {video.description && (
                <p className={styles.description}>{video.description}</p>
              )}
              <div className={styles.metadata}>
                <Calendar size={16} />
                <span>
                  {video.created_at
                    ? formatDate(video.created_at)
                    : 'Date unavailable'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && token && (
        <div className={styles.modal} onClick={() => setSelectedVideo(null)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <video
              src={selectedVideo.file_path}
              className={styles.modalVideo}
              controls
              autoPlay
            />
            <div className={styles.modalInfo}>
              <h2 className={styles.videoTitle}>
                {selectedVideo.title || 'Untitled'}
              </h2>
              {selectedVideo.description && (
                <p className={styles.description}>
                  {selectedVideo.description}
                </p>
              )}
            </div>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedVideo(null)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}

      {/* Auth Dialog */}
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
