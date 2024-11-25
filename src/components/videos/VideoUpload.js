// VideoUpload.js
import { Image as ImageIcon, Loader, Upload, Video } from 'lucide-react';
import { useRef, useState } from 'react';
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
      if (file.type.startsWith('image/')) {
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        showMessage(null);
      } else {
        showMessage('Please select a valid image file for thumbnail', 'error');
      }
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
    showMessage('Upload in progress... Please wait', 'loading');

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

    try {
      const apiUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://www.ryze.ai/api/videos/'
          : 'http://localhost:8000/videos/';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          Accept: 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnailFile(null);
      setPreview(null);
      setThumbnailPreview(null);

      showMessage('Video uploaded successfully!', 'success');

      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err) {
      showMessage(`Upload failed: ${err.message}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.uploadContainer}>
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
              accept="image/*"
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

          {message && (
            <div className={styles[messageType]}>
              {uploading && <Loader className="animate-spin mr-2" />}
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
