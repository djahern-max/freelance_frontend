import { MessageSquare, Play, ThumbsUp, Upload, X, List, Plus, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
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
import { fetchUserPlaylists } from '../../redux/playlistSlice';
import { getFullAssetUrl } from '../../utils/videoUtils';
import AddToPlaylistModal from './AddToPlaylistModal';
import DescriptionModal from './DescriptionModal';
import EditVideoModal from './VideoEdit';


// Individual video item component remains mostly the same
const VideoItem = ({
  video,
  onVideoClick,
  isAuthenticated,
  onVote,
  onSendRequest,
  onAddToPlaylist,
  onDeleteVideo,
  onEditVideo,
  user,
  formatDate,
  isInPlaylist = false
}) => {
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const isOwner = user?.id === video.user_id;

  return (
    <div className={`${styles.videoCard} ${isInPlaylist ? styles.playlistVideoCard : ''}`}>
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
                  onEditVideo(video);
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

      <DescriptionModal
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
        title={video.title}
        description={video.description}
      />
    </div>
  );
};

// Update the PlaylistGroup component to properly handle filtering
const PlaylistGroup = ({
  playlist,
  videos,
  videoTypeFilter,
  searchQuery,
  onVideoClick,
  isAuthenticated,
  onVote,
  onSendRequest,
  onAddToPlaylist,
  onDeleteVideo,
  onEditVideo,
  user,
  formatDate
}) => {
  // Start collapsed by default
  const [expanded, setExpanded] = useState(false);

  // Filter videos based on current filter criteria
  const filteredVideos = videos.filter(video => {
    // Type filter - handle undefined or null video_type for playlist videos
    const matchesType = videoTypeFilter === 'all' ||
      (video.video_type && video.video_type === videoTypeFilter);

    // Search filter
    const matchesSearch = !searchQuery ||
      (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesType && matchesSearch;
  });

  // Get the video count for display - only count filtered videos
  const videoCount = filteredVideos.length;

  // If no videos match the filter, don't show this playlist
  if (videoCount === 0) {
    return null;
  }

  return (
    <div className={styles.playlistGroup}>
      <div className={styles.playlistHeader} onClick={() => setExpanded(!expanded)}>
        <div className={styles.playlistInfo}>
          <h2 className={styles.playlistTitle}>{playlist.name || playlist.title || 'Unnamed Playlist'}</h2>
          <span className={styles.videoCount}>{videoCount} video{videoCount !== 1 ? 's' : ''}</span>
        </div>
        <button className={styles.expandButton}>
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className={styles.playlistVideos}>
          {filteredVideos.map((video) => (
            <VideoItem
              key={video.id}
              video={video}
              onVideoClick={onVideoClick}
              isAuthenticated={isAuthenticated}
              onVote={onVote}
              onSendRequest={onSendRequest}
              onAddToPlaylist={onAddToPlaylist}
              onDeleteVideo={onDeleteVideo}
              onEditVideo={onEditVideo}
              user={user}
              formatDate={formatDate}
              isInPlaylist={true}
            />
          ))}
        </div>
      )}
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
  const [processingVideos, setProcessingVideos] = useState([]);
  const [videoTypeFilter, setVideoTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVideo, setEditingVideo] = useState(null);

  const [playlists, setPlaylists] = useState([]);
  const [playlistsLoaded, setPlaylistsLoaded] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [displayMode, setDisplayMode] = useState('all'); // 'all', 'playlists', 'individual'

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  const handleEditVideo = (video) => {
    setEditingVideo(video);
  };

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
      setVideos(prevVideos => prevVideos.filter(v => v.id !== videoId));
      toast.success('Video deleted successfully');
    } catch (error) {
      console.error('Failed to delete video:', error);
      toast.error('Failed to delete video');
    }
  };

  const fetchAllPlaylists = async () => {
    try {
      // First attempt to use the endpoint that should return all public playlists
      const response = await api.get('/playlists/');

      if (response.data && Array.isArray(response.data)) {
        console.log("Successfully fetched playlists from /playlists/ endpoint");
        return response.data;
      }
    } catch (error) {
      console.log("The /playlists/ endpoint returned an error, falling back to individual fetching", error);
      // If the /playlists/ endpoint fails, we'll use our fallback method
    }

    // Fallback: Fetch the known playlists individually
    // Based on your logs, we know playlists 1 and 2 exist
    const knownPlaylistIds = [1, 2];

    try {
      const playlistPromises = knownPlaylistIds.map(id =>
        api.get(`/playlists/${id}`)
          .then(response => response.data)
          .catch(error => {
            console.error(`Error fetching playlist ${id}:`, error);
            return null;
          })
      );

      const results = await Promise.all(playlistPromises);
      // Filter out any failed requests
      return results.filter(playlist => playlist !== null);
    } catch (error) {
      console.error("Error in fallback playlist fetching:", error);
      return [];
    }
  };

  const fetchVideos = async (signal) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all videos
      const response = await api.get('/video_display/', { signal });

      if (response.data && Array.isArray(response.data.other_videos)) {
        const processedVideos = response.data.other_videos.map(video => ({
          ...video,
          video_type: video.video_type || "project_overview"
        }));
        setVideos(processedVideos);
      } else {
        setVideos([]);
      }




      // Fetch playlists
      try {
        const playlistsResponse = await api.get('/playlists/', {
          signal,
          headers: !isAuthenticated ? { 'Authorization': '' } : undefined
        });

        if (playlistsResponse.data && Array.isArray(playlistsResponse.data)) {
          // Fetch full details for each playlist
          const detailedPlaylistsPromises = playlistsResponse.data.map(async (playlist) => {
            try {
              const detailResponse = await api.get(`/playlists/${playlist.id}`, {
                signal,
                headers: !isAuthenticated ? { 'Authorization': '' } : undefined
              });

              const processedVideos = (detailResponse.data.videos || []).map(video => ({
                ...video,
                video_type: video.video_type || "project_overview"
              }));

              return {
                ...playlist,
                ...detailResponse.data,
                expanded: false,
                videos: processedVideos
              };
            } catch (error) {
              if (error.name === 'AbortError') {
                return null;
              }
              console.error(`Error fetching playlist ${playlist.id} details:`, error);
              return null;
            }
          });

          const results = await Promise.all(detailedPlaylistsPromises);
          const validPlaylists = results.filter(playlist => playlist !== null);
          setPlaylists(validPlaylists);
          setPlaylistsLoaded(true);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          return;
        }
        console.error("Error fetching playlists:", error);
        setPlaylists([]);
        setPlaylistsLoaded(true);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Video request was cancelled');
        return;
      }

      console.error('Fetch error:', err);

      if (err.message === 'REQUEST_CANCELLED') {
        console.log('Request was cancelled, likely due to component unmount');
        return;
      }

      if (err.response?.status === 401) {
        setVideos([]);
      } else {
        setError("We're having trouble loading the videos. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update main useEffect for component mount
  useEffect(() => {
    const controller = new AbortController();

    const initialLoad = async () => {
      try {
        // Initial load of videos and public playlists
        await fetchVideos(controller.signal);

        // If authenticated, additionally fetch user playlists
        if (isAuthenticated && user) {
          await fetchUserPlaylists(controller.signal);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Component unmounted, requests cancelled');
          return;
        }
        console.error('Error in initial load:', error);
      }
    };

    initialLoad();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, user]);




  const sortVideosByPlaylist = async (videoArray) => {
    try {
      const playlistResponse = await api.playlists.getPlaylistDetails(1);

      if (!playlistResponse) {
        console.log('Playlist #1 not found, returning unsorted videos');
        return videoArray;
      }

      if (!playlistResponse.videos || !Array.isArray(playlistResponse.videos)) {
        return videoArray;
      }

      const videoOrderMap = new Map();

      playlistResponse.videos.forEach((video, index) => {
        const order = video.order !== undefined ? video.order : index;
        videoOrderMap.set(video.id, order);
      });

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

  const cleanupProcessingVideos = () => {
    const processingVideos = JSON.parse(localStorage.getItem('processingVideos') || '[]');
    if (processingVideos.length === 0) return;

    const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
    const updatedProcessingVideos = processingVideos.filter(video => {
      return video.timestamp && video.timestamp > fifteenMinutesAgo;
    });

    const loadedVideoIds = videos.map(v => v.id);
    const stillProcessing = updatedProcessingVideos.filter(video =>
      !loadedVideoIds.includes(video.id)
    );

    if (stillProcessing.length !== processingVideos.length) {
      localStorage.setItem('processingVideos', JSON.stringify(stillProcessing));
      setProcessingVideos(stillProcessing);

      if (processingVideos.length > stillProcessing.length) {
        toast.success('Upload Complete!');
      }
    }
  };

  useEffect(() => {
    if (videos.length > 0) {
      cleanupProcessingVideos();
    }
  }, [videos]);

  useEffect(() => {
    const storedProcessingVideos = localStorage.getItem('processingVideos');
    if (storedProcessingVideos) {
      try {
        const parsedVideos = JSON.parse(storedProcessingVideos);
        if (Array.isArray(parsedVideos) && parsedVideos.length > 0) {
          setProcessingVideos(parsedVideos);

          const checkInterval = setInterval(() => {
            fetchVideos().then(() => {
              const currentProcessing = JSON.parse(localStorage.getItem('processingVideos') || '[]');
              if (currentProcessing.length === 0) {
                clearInterval(checkInterval);
              }
            });
          }, 30000);

          return () => clearInterval(checkInterval);
        }
      } catch (error) {
        console.error('Error parsing processing videos:', error);
        localStorage.removeItem('processingVideos');
      }
    }
  }, []);





  // If user is authenticated, additionally fetch their personal playlists as well
  const fetchUserPlaylists = async (signal) => {
    if (!isAuthenticated || !user) return;

    try {
      // Get all playlists for the current user
      const userPlaylistsResponse = await api.get(`/playlists/user/${user.id}`, { signal });

      if (!Array.isArray(userPlaylistsResponse.data)) {
        console.error('Unexpected playlist response format:', userPlaylistsResponse.data);
        return;
      }

      // When fetching playlist details:
      const detailedPlaylists = await Promise.all(
        userPlaylistsResponse.data.map(async (playlist) => {
          try {
            const detailResponse = await api.get(`/playlists/${playlist.id}`, { signal });

            // Ensure all playlist videos have a valid video_type property
            const processedVideos = (detailResponse.data.videos || []).map(video => ({
              ...video,
              video_type: video.video_type || "project_overview"
            }));

            // Make sure to preserve ALL properties from both responses
            return {
              ...playlist,                   // Original playlist data
              ...detailResponse.data,        // Detailed playlist data
              expanded: false,               // Start collapsed by default
              videos: processedVideos
            };
          } catch (error) {
            if (error.name === 'AbortError') {
              return null;
            }
            console.error(`Error fetching playlist ${playlist.id} details:`, error);
            return null;
          }
        })
      );

      // Filter out null results (from aborted requests)
      const validUserPlaylists = detailedPlaylists.filter(playlist => playlist !== null);
      setUserPlaylists(validUserPlaylists);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('User playlists request was cancelled');
        return;
      }
      console.error("Error fetching user playlists:", error);
      setUserPlaylists([]);
    }
  };



  // Replace your existing useEffect for loading data with this one
  useEffect(() => {
    const controller = new AbortController();

    const initialLoad = async () => {
      try {
        // Initial load of videos and public playlists
        await fetchVideos(controller.signal);

        // If authenticated, additionally fetch user playlists
        if (isAuthenticated && user) {
          await fetchUserPlaylists(controller.signal);
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Component unmounted, requests cancelled');
          return;
        }
        console.error('Error in initial load:', error);
      }
    };

    initialLoad();

    return () => {
      controller.abort();
    };
  }, [isAuthenticated, user]);



  // Filter videos based on current filters (search query and video type)
  const filterVideos = (videoList) => {
    return videoList.filter(video => {
      // Type filter - be more strict with type matching
      const matchesType = videoTypeFilter === 'all' ||
        (video.video_type && video.video_type === videoTypeFilter);

      // Search filter
      const matchesSearch = !searchQuery ||
        (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  };
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

  // Get videos that are not in any playlist
  const getNonPlaylistVideos = () => {
    const playlistVideoIds = new Set();

    // Include videos from public playlists
    playlists.forEach(playlist => {
      playlist.videos.forEach(video => {
        playlistVideoIds.add(video.id);
      });
    });

    // Include videos from user playlists
    userPlaylists.forEach(playlist => {
      playlist.videos.forEach(video => {
        playlistVideoIds.add(video.id);
      });
    });

    return videos.filter(video => !playlistVideoIds.has(video.id));
  };



  // Filter videos based on current filters
  const getFilteredVideos = (videoList) => {
    return videoList.filter(video => {
      // Type filter
      const matchesType = videoTypeFilter === 'all' || video.video_type === videoTypeFilter;

      // Search filter
      const matchesSearch = !searchQuery ||
        (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesType && matchesSearch;
    });
  };

  if (error || (!loading && videos.length === 0)) {
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



  const individualVideos = getNonPlaylistVideos();
  const filteredIndividualVideos = filterVideos(individualVideos);



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

        {/* Display mode toggle */}
        <div className={styles.displayToggle}>
          <button
            className={`${styles.displayToggleButton} ${displayMode === 'all' ? styles.active : ''}`}
            onClick={() => setDisplayMode('all')}
          >
            All Videos
          </button>
          <button
            className={`${styles.displayToggleButton} ${displayMode === 'playlists' ? styles.active : ''}`}
            onClick={() => setDisplayMode('playlists')}
          >
            Playlists
          </button>
          <button
            className={`${styles.displayToggleButton} ${displayMode === 'individual' ? styles.active : ''}`}
            onClick={() => setDisplayMode('individual')}
          >
            Individual Videos
          </button>
        </div>
      </div>

      {processingVideos.length > 0 && (
        <div className={styles.processingBanner}>
          <div className={styles.processingInfo}>
            <div className={styles.spinner}></div>
            <div>
              <h3>Videos Processing</h3>
              <p>
                Your videos are being optimized for best quality playback.
                This continues in the background even if you navigate away or close this tab.
                You'll be notified when processing is complete.
              </p>
            </div>
          </div>

          <ul className={styles.processingList}>
            {processingVideos.map(video => (
              <li key={video.id || video.tempId}>
                {video.title} <span className={styles.processingStatus}>Processing...</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Re-enabled search controls with improved styling */}
      <div className={styles.videoControlsBar}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* <div className={styles.filterContainer}>
          <select
            value={videoTypeFilter}
            onChange={(e) => setVideoTypeFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="solution_demo">Solution Demo</option>
            <option value="project_overview">Project Overview</option>
            <option value="progress_update">Progress Update</option>
            <option value="pitch_contest">Pitch Contest</option>
            <option value="tutorials">Tutorials</option>
          </select>
        </div> */}
      </div>

      {/* Playlists Section with Label */}
      {(displayMode === 'all' || displayMode === 'playlists') && (playlists.length > 0 || userPlaylists.length > 0) && (
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>
            <List size={20} className={styles.sectionIcon} />
            <span>Playlists</span>
            <span className={styles.videoCountBadge}>
              {/* Count filtered videos in playlists */}
            </span>
          </h2>
          <div className={styles.playlistsContainer}>
            {/* Create a Map to store unique playlists by ID */}
            {(() => {
              const uniquePlaylists = new Map();

              // Add public playlists to the map
              playlists.forEach(playlist => {
                uniquePlaylists.set(playlist.id, playlist);
              });

              // Add user playlists to the map - this will overwrite any duplicates
              userPlaylists.forEach(playlist => {
                uniquePlaylists.set(playlist.id, playlist);
              });

              // Convert the Map values back to an array
              return Array.from(uniquePlaylists.values()).map(playlist => {
                const filteredPlaylistVideos = playlist.videos.filter(video => {
                  const matchesType = videoTypeFilter === 'all' ||
                    (video.video_type && video.video_type === videoTypeFilter);
                  const matchesSearch = !searchQuery ||
                    (video.title && video.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (video.description && video.description.toLowerCase().includes(searchQuery.toLowerCase()));
                  return matchesType && matchesSearch;
                });

                if (filteredPlaylistVideos.length === 0) return null;

                return (
                  <PlaylistGroup
                    key={playlist.id}
                    playlist={playlist}
                    videos={playlist.videos}
                    videoTypeFilter={videoTypeFilter}
                    searchQuery={searchQuery}
                    onVideoClick={handleVideoClick}
                    isAuthenticated={isAuthenticated}
                    onVote={handleVote}
                    onSendRequest={handleSendRequest}
                    onAddToPlaylist={handleAddToPlaylist}
                    onDeleteVideo={handleDeleteVideo}
                    onEditVideo={handleEditVideo}
                    user={user}
                    formatDate={formatDate}
                  />
                );
              }).filter(Boolean);
            })()}


          </div>
        </div>
      )}


      {/* No results message */}
      {searchQuery &&
        ((displayMode === 'all' &&
          filteredIndividualVideos.length === 0 &&
          playlists.every(p => filterVideos(p.videos).length === 0)) ||
          (displayMode === 'playlists' &&
            playlists.every(p => filterVideos(p.videos).length === 0)) ||
          (displayMode === 'individual' &&
            filteredIndividualVideos.length === 0)) && (
          <div className={styles.noResultsContainer}>
            <div className={styles.noResultsContent}>
              <MessageSquare size={32} className={styles.noResultsIcon} />
              <h3>No matching videos found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <button
                className={styles.clearFiltersButton}
                onClick={() => {
                  setSearchQuery('');
                  setVideoTypeFilter('all');
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        )}

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