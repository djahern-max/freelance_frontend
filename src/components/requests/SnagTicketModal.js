import { useState } from 'react';
import styles from './SnagTicketModal.module.css';

const SnagTicketModal = ({
  isOpen,
  onClose,
  onSubmit,
  videos = [],
  profileUrl,
}) => {
  const [message, setMessage] = useState('');
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [includeProfile, setIncludeProfile] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      message,
      videoIds: selectedVideos,
      includeProfile,
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Start Conversation</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Message to Client</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={styles.textarea}
              placeholder="Introduce yourself and explain why you're interested in this project..."
              required
            />
          </div>

          {videos.length > 0 && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Link Videos</label>
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
              <span>Include link to my profile</span>
            </label>
          )}

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnagTicketModal;
