import { Loader2, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../../../utils/api';
import styles from './CreateRequestModal.module.css';

const CreateRequestModal = ({
  creatorId,
  creatorUsername,
  onClose,
  onRequestSent,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    estimated_budget: '',
    is_public: false,
    project_id: '',
  });

  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get('/projects/');
        setProjects(response.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects');
      } finally {
        setIsLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const response = await api.post('/projects/', {
        name: newProjectName,
        description: '',
      });

      setProjects([...projects, response.data]);
      setFormData({ ...formData, project_id: response.data.id });
      setShowNewProjectForm(false);
      setNewProjectName('');
    } catch (err) {
      setError('Failed to create project');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const requestResponse = await api.post('/requests/', {
        ...formData,
        project_id: formData.project_id || null,
        estimated_budget: formData.estimated_budget
          ? Number(formData.estimated_budget)
          : null,
      });

      await api.post(`/requests/${requestResponse.data.id}/share`, {
        shared_with_user_id: creatorId,
        can_edit: true,
      });

      onRequestSent?.();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.detail || 'Failed to create and share request'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>

        <h2 className={styles.title}>Send Request to {creatorUsername}</h2>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.projectSection}>
            <label className={styles.label}>Project (Optional)</label>
            {isLoadingProjects ? (
              <div className={styles.loadingSpinner}>
                <Loader2 className="animate-spin" size={16} />
                <span>Loading projects...</span>
              </div>
            ) : (
              <>
                <select
                  value={formData.project_id}
                  onChange={(e) =>
                    setFormData({ ...formData, project_id: e.target.value })
                  }
                  className={styles.select}
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>

                {!showNewProjectForm ? (
                  <button
                    type="button"
                    onClick={() => setShowNewProjectForm(true)}
                    className={styles.createProjectButton}
                  >
                    <Plus size={16} className="mr-1" />
                    Create New Project
                  </button>
                ) : (
                  <div className={styles.newProjectForm}>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className={styles.input}
                    />
                    <button
                      type="button"
                      onClick={handleCreateProject}
                      className={styles.submitButton}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewProjectForm(false)}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Request Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className={styles.input}
              required
              placeholder="Enter a title for your request"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description *</label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className={styles.textarea}
              rows={4}
              required
              placeholder="Describe what you need help with..."
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Estimated Budget ($)</label>
            <input
              type="number"
              value={formData.estimated_budget}
              onChange={(e) =>
                setFormData({ ...formData, estimated_budget: e.target.value })
              }
              className={styles.input}
              min="0"
              step="0.01"
              placeholder="Enter estimated budget (optional)"
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequestModal;
