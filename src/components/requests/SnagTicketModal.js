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

    // Create the payload exactly matching what the backend expects
    const payload = {
      message,
      video_ids: selectedVideos,  // Array of video IDs
      profile_link: includeProfile, // This matches backend's SnaggedRequestCreate schema
      include_profile: includeProfile // This matches the ConversationMessageCreate schema
    };


    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Send Your Sales Pitch</h2>
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

          {/* Video Selection Section */}
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

          {/* Profile Link Section */}
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
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? 'Snagging Request...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnagTicketModal;