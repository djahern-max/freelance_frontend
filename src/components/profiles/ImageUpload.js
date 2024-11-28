import { Upload } from 'lucide-react';
import { useState } from 'react';
import api from '../../utils/api';
import styles from './ImageUpload.module.css';

const ImageUpload = ({
  onUploadSuccess,
  onFileSelect,
  currentImageUrl,
  mode = 'upload',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

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

    if (mode === 'select') {
      // Just pass the file back for profile creation
      onFileSelect(file);
      return;
    }

    // Handle immediate upload for profile updates
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
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      {currentImageUrl ? (
        <div className={styles.imageContainer}>
          <img
            src={currentImageUrl}
            alt="Profile"
            className={styles.profileImage}
          />
          <label htmlFor="image-upload" className={styles.uploadButton}>
            <Upload size={16} />
          </label>
        </div>
      ) : (
        <label htmlFor="image-upload" className={styles.uploadPlaceholder}>
          <Upload size={24} />
          <span className={styles.uploadText}>Upload Image</span>
        </label>
      )}

      <input
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className={styles.fileInput}
        disabled={isUploading}
      />

      {isUploading && <div className={styles.uploadingText}>Uploading...</div>}

      {error && <div className={styles.errorText}>{error}</div>}
    </div>
  );
};

export default ImageUpload;
