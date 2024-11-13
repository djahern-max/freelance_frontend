import React, { useState } from "react";
import styles from "./CreateRequestModal.module.css";

const CreateRequestModal = ({ projectId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    estimated_budget: "",
    is_public: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      project_id: projectId,
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Create New Request</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="content">Description</label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="budget">Estimated Budget ($)</label>
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
            />
          </div>

          <div className={styles.formGroup}>
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
              />
              Make this request public
            </label>
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Create Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
