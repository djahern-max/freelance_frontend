import PropTypes from 'prop-types';
import { useState } from 'react';
import styles from './CreateRequestModal.module.css';

const CreateRequestModal = ({
  initialData = null,
  onClose,
  onSubmit,
  creatorId,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    estimated_budget: initialData?.estimated_budget || '',
    is_public: initialData?.is_public || false,
    project_id: initialData?.project_id || null,
    is_idea: initialData?.is_idea || false,
    seeks_collaboration: initialData?.seeks_collaboration || false,
    collaboration_details: initialData?.collaboration_details || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const submissionData = {
      ...formData,
      estimated_budget: formData.estimated_budget === '' ? null : Number(formData.estimated_budget),
      creatorId,
    };

    try {
      await onSubmit(submissionData);
      onClose();
    } catch (err) {
      console.error('Error submitting request:', err);
      setError(err.response?.data?.detail || 'Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
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
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
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
              onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
              required
              placeholder="Describe what you need help with..."
              className={styles.textarea}
              rows="4"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.checkboxContainer}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_idea}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    is_idea: e.target.checked,
                    estimated_budget: e.target.checked ? '' : prev.estimated_budget
                  }))
                }
                className={styles.checkbox}
                disabled={isSubmitting}
              />
              <span className={styles.checkboxText}>
                This is just an idea - I'm not ready to commit to a budget
              </span>
            </label>
          </div>

          {formData.is_idea && (
            <div className={styles.collaborationSection}>
              <div className={styles.checkboxContainer}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.seeks_collaboration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seeks_collaboration: e.target.checked
                      }))
                    }
                    className={styles.checkbox}
                    disabled={isSubmitting}
                  />
                  <span className={styles.checkboxText}>
                    I'm interested in collaborating with a developer
                  </span>
                </label>
              </div>

              {formData.seeks_collaboration && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="collaboration_details">
                    Collaboration Details
                  </label>
                  <textarea
                    id="collaboration_details"
                    value={formData.collaboration_details}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        collaboration_details: e.target.value
                      }))
                    }
                    placeholder="Describe how you'd like to collaborate (e.g., testing, feedback, shared development)..."
                    className={styles.textarea}
                    rows="3"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
          )}

          {!formData.is_idea && (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="budget">
                Estimated Budget ($)
              </label>
              <input
                type="number"
                id="budget"
                value={formData.estimated_budget}
                onChange={(e) => setFormData((prev) => ({ ...prev, estimated_budget: e.target.value }))}
                min="0"
                step="1"
                placeholder="Enter budget in USD"
                className={styles.input}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <div className={styles.checkboxContainer}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_public: e.target.checked }))}
                  className={styles.checkbox}
                  disabled={isSubmitting}
                />
                <span className={styles.checkboxText}>
                  Make this request public
                </span>
              </label>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button
              type="submit"
              className={`${styles.submitButton} ${isSubmitting ? styles.loading : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Request'
                  : 'Create Request'}
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

CreateRequestModal.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    content: PropTypes.string,
    estimated_budget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    is_public: PropTypes.bool,
    project_id: PropTypes.number,
    is_idea: PropTypes.bool,
    seeks_collaboration: PropTypes.bool,
    collaboration_details: PropTypes.string,
  }),
  onSubmit: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  creatorId: PropTypes.number.isRequired,
  isEditing: PropTypes.bool,
};

export default CreateRequestModal;
