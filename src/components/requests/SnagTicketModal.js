import { X } from 'lucide-react';
import { useState } from 'react';
import styles from './SnagTicketModal.module.css';

const SnagTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  videos = [],
  profileUrl,
  isLoading = false,
  error = null,
}) => {
  const [message, setMessage] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [includeProfile, setIncludeProfile] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      message,
      video_ids: selectedVideos,
      profile_link: includeProfile,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Snag This Request</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Why are you interested?</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
              placeholder="Explain why you're interested in this request and what makes you a good fit..."
              required
            />
          </div>

          {videos.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Link Relevant Videos</label>
              <div className={styles.videoList}>
                {videos.map((video) => (
                  <label key={video.id} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedVideos.includes(video.id)}
                      onChange={(e) => {
                        setSelectedVideos((prev) =>
                          e.target.checked
                            ? [...prev, video.id]
                            : prev.filter((id) => id !== video.id)
                        );
                      }}
                      className={styles.checkbox}
                    />
                    <span>{video.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {profileUrl && (
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={includeProfile}
                onChange={(e) => setIncludeProfile(e.target.checked)}
                className={styles.checkbox}
              />
              <span>Include my profile link</span>
            </label>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? 'Snagging Request...' : 'Snag Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnagTicketModal;
