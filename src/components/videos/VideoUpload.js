import {
  ArrowLeft,
  Image as ImageIcon,
  Loader,
  Upload,
  Video,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './VideoUpload.module.css';


const VideoUpload = ({ projectId, requestId, onUploadSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [preview, setPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [projectUrl, setProjectUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoType, setVideoType] = useState('solution_demo');


  const navigate = useNavigate();

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    if (type === 'success') {
      setTimeout(() => {
        setMessage(null);
        setMessageType(null);
      }, 5000);
    }
  };

  const handleVideoSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        setPreview(URL.createObjectURL(file));
        showMessage(null);
      } else {
        showMessage('Please select a valid video file', 'error');
      }
    }
  };

  const handleThumbnailSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.match('image/(jpeg|jpg|png|gif|bmp)')) {
        showMessage('Please select a JPG, PNG, BMP or GIF file', 'error');
        return;
      }

      // Check file size - YouTube's limit is 2MB
      if (file.size > 2 * 1024 * 1024) {
        showMessage('Image must be under 2MB', 'error');
        return;
      }

      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(img.src);

        // YouTube minimum width is 640px
        if (img.width < 640) {
          showMessage('Image width must be at least 640 pixels', 'error');
          return;
        }

        // Check for 16:9 aspect ratio with some tolerance
        const aspectRatio = img.width / img.height;
        const targetRatio = 16 / 9;
        const tolerance = 0.1; // Allow 10% deviation

        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          showMessage(
            'Image must have a 16:9 aspect ratio (like 1280x720 pixels)',
            'error'
          );
          return;
        }

        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        showMessage(null);
      };

      img.onerror = () => {
        showMessage('Failed to load image. Please try another file.', 'error');
      };

      img.src = URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) {
      showMessage('Please select a video file', 'error');
      return;
    }

    if (!title.trim()) {
      showMessage('Please enter a title', 'error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setIsProcessing(false);
    showMessage('Upload in progress...', 'loading');



    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', videoFile);

    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    if (projectId) {
      formData.append('project_id', projectId);
    }

    if (requestId) {
      formData.append('request_id', requestId);
    }

    if (projectUrl) {
      formData.append('project_url', projectUrl);

    }
    formData.append('video_type', videoType);
    try {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? '/api/videos/'
          : 'http://localhost:8000/videos/';

      // Create an XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);

          // When upload reaches 100%, show processing message
          if (progress >= 100 && !isProcessing) {
            setIsProcessing(true);
          }
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);

          // Add to processing videos in localStorage
          const processingVideos = JSON.parse(localStorage.getItem('processingVideos') || '[]');
          const newVideo = {
            id: data.id,
            title: data.title || title,
            tempId: Date.now(),
            timestamp: Date.now()
          };

          processingVideos.push(newVideo);
          localStorage.setItem('processingVideos', JSON.stringify(processingVideos));

          // Set processing to true explicitly
          setIsProcessing(true);
          setUploading(true); // Keep this true so progress bar remains visible

          // Message should be very clear
          showMessage('PROCESSING VIDEO - You can navigate away!', 'processing');

          // Reset form fields but keep message visible
          setTitle('');
          setDescription('');
          setVideoFile(null);
          setThumbnailFile(null);
          setPreview(null);
          setThumbnailPreview(null);
          setProjectUrl('');

          // Redirect after a longer delay to ensure user sees the message
          setTimeout(() => {
            navigate('/videos');
          }, 8000); // Give user 8 seconds to read the message
        } else {
          throw new Error(`Upload failed: ${xhr.statusText}`);
        }
      });

      xhr.addEventListener('error', () => {
        throw new Error('Network error occurred during upload');
      });

      xhr.open('POST', apiUrl, true);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(formData);

    } catch (err) {
      showMessage(`Upload failed: ${err.message}`, 'error');
      setUploading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.uploadContainer}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className={styles.title}>Upload Video</h1>

        <form onSubmit={handleSubmit} className={styles.uploadForm}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Title</label>
            <input
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={uploading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              disabled={uploading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Project URL (Optional)</label>
            <input
              type="url"
              className={styles.input}
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              placeholder="Enter project URL (optional)"
              disabled={uploading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Video Type</label>
            <select
              className={styles.input}
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              disabled={uploading}
            >
              <option value="solution_demo">Solution Demo</option>
              <option value="project_overview">Project Overview</option>
              <option value="progress_update">Progress Update</option>
              <option value="pitch_contest">Pitch Contest</option>
              <option value="tutorials">Tutorials</option>
            </select>
          </div>

          <div className={styles.uploadButtons}>
            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => videoInputRef.current?.click()}
              disabled={uploading}
            >
              <Video size={24} />
              <span>{videoFile ? 'Change Video' : 'Select Video'}</span>
            </button>

            <button
              type="button"
              className={styles.uploadButton}
              onClick={() => thumbnailInputRef.current?.click()}
              disabled={uploading}
            >
              <ImageIcon size={24} />
              <span>
                {thumbnailFile ? 'Change Thumbnail' : 'Select Thumbnail'}
              </span>
              <div className={styles.thumbnailRequirements}>
                <small>Best quality: 1280x720 pixels (16:9)</small>
                <small>Minimum width: 640 pixels</small>
                <small>File types: JPG, PNG, BMP, GIF</small>
                <small>Max file size: 2MB</small>
              </div>
            </button>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/bmp"
              onChange={handleThumbnailSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
          </div>

          {preview && (
            <div className={styles.preview}>
              <video src={preview} className={styles.videoPreview} controls />
            </div>
          )}

          {thumbnailPreview && (
            <div className={styles.preview}>
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className={styles.thumbnailPreview}
              />
            </div>
          )}



          {/* New message that shows after uploading is complete */}
          {isProcessing && (
            <div className={styles.processingOverlay}>
              <div className={styles.processingCard}>
                <div className={styles.processingIcon}>
                  <Loader size={36} className={styles.processingLoader} />
                </div>
                <h2 className={styles.processingTitle}>Video Processing Started</h2>
                <div className={styles.processingInfo}>
                  <p className={styles.processingMainMessage}>
                    <strong>Your video is being compressed with FFMPEG</strong>
                  </p>
                  <div className={styles.processingDivider}></div>
                  <p className={styles.processingDirections}>
                    This process will continue in the background and may take several minutes.
                  </p>
                  <p className={styles.processingAction}>
                    <strong>You can safely navigate away from this page.</strong>
                  </p>
                  <p className={styles.processingFinalNote}>
                    Your video will appear in your library when processing is complete.
                  </p>
                </div>
                <button
                  className={styles.processingContinueButton}
                  onClick={() => navigate('/videos')}
                >
                  Go to Video Library
                </button>
              </div>
            </div>
          )}

          {/* Regular upload progress bar (only show when not processing) */}
          {uploading && !isProcessing && (
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBar}
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span className={styles.progressText}>
                Uploading: {uploadProgress}%
              </span>
            </div>
          )}

          {/* Message display - add 'processing' message type */}
          {message && (
            <div className={styles[messageType]}>
              {messageType === 'loading' && <Loader className="animate-spin mr-2" size={16} />}
              {messageType === 'processing' && <Loader className="animate-spin mr-2" size={16} />}
              {message}
            </div>
          )}

          <div className={styles.submitButtonContainer}>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2" />
                  Upload Video
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;