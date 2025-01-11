import { Upload, X } from 'lucide-react';
import { useState } from 'react';
import api from '../../utils/api';
import styles from './ImageUpload.module.css';

const ImageUpload = ({
  onUploadSuccess,
  currentImageUrl,
  showSkip = false,
  onSkip,
}) => {
  ;
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
      console.error('Upload error:', err);
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
      {displayImage ? (
        <div className={styles.imageContainer}>
          <img
            src={displayImage}
            alt="Profile"
            className={styles.profileImage}
          />
          <div className={styles.imageActions}>
            <label
              htmlFor="image-upload"
              className={styles.uploadButton}
              title="Change image"
            >
              <Upload size={16} />
            </label>
            {previewUrl && (
              <button
                className={styles.clearButton}
                onClick={handleClearPreview}
                title="Clear selection"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className={styles.uploadSection}>
          <label htmlFor="image-upload" className={styles.uploadPlaceholder}>
            <Upload size={24} />
            <span className={styles.uploadText}>
              {isUploading ? 'Uploading...' : 'Upload Profile Picture'}
            </span>
          </label>
          {showSkip && (
            <div className={styles.skipContainer}>
              <span onClick={onSkip} className={styles.skipLink}>
                I'll do this later
              </span>
            </div>
          )}
        </div>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.fileInput}
        disabled={isUploading}
      />

      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};

export default ImageUpload;
