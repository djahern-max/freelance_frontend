import { useState } from 'react';
import styles from './CreateRequestModal.module.css';

const CreateRequestModal = ({ projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    estimated_budget: '',
    is_public: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ...formData,
        project_id: projectId,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Request</h1>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="title">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
              placeholder="Enter a descriptive title"
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="content">
              Description
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              required
              placeholder="Describe what you need help with..."
              className={styles.input}
              rows="4"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="budget">
              Estimated Budget ($)
              <div className={styles.tooltip}></div>
            </label>
            <input
              type="number"
              id="budget"
              value={formData.estimated_budget}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  estimated_budget: e.target.value,
                }))
              }
              required
              min="0"
              step="1"
              placeholder="Enter budget in USD"
              className={styles.input}
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_public: e.target.checked,
                    }))
                  }
                  className={styles.checkbox}
                  disabled={isSubmitting}
                />
                <span className={styles.checkboxText}>
                  Make this request public
                </span>
              </label>
              <div className={styles.helpText}>
                Public requests will be visible to all developers on the
                platform
              </div>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button
              type="submit"
              className={`${styles.submitButton} ${
                isSubmitting ? styles.loading : ''
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
