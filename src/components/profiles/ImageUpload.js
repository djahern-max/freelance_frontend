import { Upload, X, Camera } from 'lucide-react';
import { useState } from 'react';
import api from '../../utils/api';
import styles from './ImageUpload.module.css';

const ImageUpload = ({
  onUploadSuccess,
  currentImageUrl,
  showSkip = false,
  onSkip,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      return;
    }

    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Handle upload
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/profile/developer/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onUploadSuccess(response.data.image_url);
      setPreviewUrl(null); // Clear preview after successful upload
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error details:', err.response?.data || err.message);
      console.error('Full error object:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearPreview = () => {
    setPreviewUrl(null);
    setError(null);
  };

  const displayImage = previewUrl || currentImageUrl;

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        {displayImage ? (
          <div className={styles.imageContainer}>
            <img
              src={displayImage}
              alt="Profile"
              className={styles.profileImage}
            />
            <div className={styles.imageOverlay}>
              <label
                htmlFor="image-upload"
                className={styles.changeImageButton}
                title="Change image"
              >
                <Camera size={24} />
              </label>
            </div>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <label htmlFor="image-upload" className={styles.uploadLabel}>
              <Upload size={32} />
              <span className={styles.uploadText}>
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </span>
            </label>
          </div>
        )}
      </div>

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.fileInput}
        disabled={isUploading}
      />

      {error && <div className={styles.error}>{error}</div>}

      {showSkip && !displayImage && (
        <button onClick={onSkip} className={styles.skipButton}>
          I'll do this later
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
