// VideoUpload.js
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Image, Film } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './VideoUpload.module.css';

const VideoUpload = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [videoType, setVideoType] = useState('solution_demo');
  const [isPublic, setIsPublic] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (limit to 500MB for example)
      if (file.size > 500 * 1024 * 1024) {
        toast.error('Video file is too large. Maximum size is 500MB.');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file.');
        return;
      }

      setVideoFile(file);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file for thumbnail.');
        return;
      }

      setThumbnailFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnailFile(null);
    setThumbnailPreview('');
    setVideoType('solution_demo');
    setIsPublic(true);
    setUploadProgress(0);

    // Reset file inputs
    if (videoInputRef.current) videoInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      toast.error('Please select a video file to upload.');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title for your video.');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('file', videoFile);
      formData.append('video_type', videoType);

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Track upload progress
      const uploadConfig = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      // Use the correct endpoint
      const response = await api.post('/videos/', formData, uploadConfig);

      console.log('Upload successful:', response.data);

      // Add processing video to localStorage for tracking
      const processingVideos = JSON.parse(localStorage.getItem('processingVideos') || '[]');
      const newVideo = {
        id: response.data.id,
        title: title,
        timestamp: Date.now(),
        tempId: Date.now().toString()
      };

      localStorage.setItem('processingVideos', JSON.stringify([...processingVideos, newVideo]));

      toast.success('Video uploaded successfully! It may take a few moments to process.');
      resetForm();

      // Redirect to videos page
      navigate('/videos');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Please try again later'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.uploadContainer}>
      <div className={styles.uploadCard}>
        <h1 className={styles.uploadTitle}>Upload New Video</h1>

        <form onSubmit={handleSubmit} className={styles.uploadForm}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title (required)</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              required
              disabled={isUploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={4}
              disabled={isUploading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="videoType">Video Type</label>
            <select
              id="videoType"
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              disabled={isUploading}
            >
              <option value="solution_demo">Solution Demo</option>
              <option value="project_overview">Project Overview</option>
              <option value="progress_update">Progress Update</option>
              <option value="pitch_contest">Pitch Contest</option>
              <option value="tutorials">Tutorials</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isUploading}
              />
              <span>Make this video public</span>
            </label>
          </div>

          <div className={styles.fileUploadSection}>
            <div className={styles.fileUpload}>
              <label className={styles.fileUploadLabel}>
                <span>Video File (required)</span>
                <div
                  className={`${styles.dropZone} ${videoFile ? styles.hasFile : ''}`}
                  onClick={() => videoInputRef.current?.click()}
                >
                  {videoFile ? (
                    <div className={styles.selectedFile}>
                      <Film size={24} />
                      <span className={styles.fileName}>{videoFile.name}</span>
                      <button
                        type="button"
                        className={styles.removeFile}
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoFile(null);
                          if (videoInputRef.current) videoInputRef.current.value = '';
                        }}
                        disabled={isUploading}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <Upload size={32} />
                      <span>Click to select video file</span>
                      <span className={styles.supportedFormats}>
                        Supported formats: MP4, MOV, AVI (max: 500MB)
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={videoInputRef}
                  onChange={handleVideoChange}
                  accept="video/*"
                  className={styles.hiddenInput}
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className={styles.fileUpload}>
              <label className={styles.fileUploadLabel}>
                <span>Thumbnail (optional)</span>
                <div
                  className={`${styles.dropZone} ${thumbnailPreview ? styles.hasFile : ''}`}
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  {thumbnailPreview ? (
                    <div className={styles.thumbnailPreview}>
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className={styles.previewImage}
                      />
                      <button
                        type="button"
                        className={styles.removeThumbnail}
                        onClick={(e) => {
                          e.stopPropagation();
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                          if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                        }}
                        disabled={isUploading}
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadPrompt}>
                      <Image size={32} />
                      <span>Click to select thumbnail image</span>
                      <span className={styles.supportedFormats}>
                        Supported formats: JPG, PNG (16:9 ratio recommended)
                      </span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={thumbnailInputRef}
                  onChange={handleThumbnailChange}
                  accept="image/*"
                  className={styles.hiddenInput}
                  disabled={isUploading}
                />
              </label>
            </div>
          </div>

          {isUploading && (
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <div className={styles.progressText}>
                Uploading... {uploadProgress}%
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate('/videos')}
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isUploading || !videoFile || !title.trim()}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;