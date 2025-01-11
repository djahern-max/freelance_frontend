import { FolderPlus, Info, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import ProjectHandler from './ProjectHandler';
import styles from './RequestGroupingToolbar.module.css';

const RequestGroupingToolbar = ({
  selectedRequests,
  projects,
  onGroup,
  onCreateProject,
  onClearSelection,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGroup = async () => {
    if (!selectedProjectId || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const result = await ProjectHandler.addRequestsToProject(
        selectedProjectId,
        selectedRequests
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Requests grouped successfully', {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: styles.toast,
      });
      setSelectedProjectId('');

      if (onGroup) {
        await onGroup(selectedProjectId);
      }
      onClearSelection();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const trimmedName = newProjectName.trim();



      if (!trimmedName) {
        throw new Error('Project name is required');
      }

      if (trimmedName.length < 3) {
        throw new Error('Project name must be at least 3 characters long');
      }

      // Just pass the name string, not the full project data
      const success = await onCreateProject(trimmedName);

      if (success) {
        setNewProjectName('');
        setShowNewProject(false);
      }
    } catch (err) {
      console.error('Project creation error:', err);
      setError(err.message || 'An unexpected error occurred');
      toast.error(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.toolbarContainer}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      {showTooltip && (
        <div className={styles.tooltip}>
          <Info size={20} className={styles.infoIcon} />
          <div className={styles.tooltipContent}>
            <h4>Organize Your Requests</h4>
            <p>
              Group related requests into projects for better organization and
              tracking.
            </p>
            <ul>
              <li>Select multiple requests using the checkboxes</li>
              <li>Choose an existing project or create a new one</li>
              <li>Click "Group Selected" to organize your requests</li>
            </ul>
            <button
              className={styles.tooltipClose}
              onClick={() => setShowTooltip(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <div className={styles.toolbar}>
        <div className={styles.info}>
          <div className={styles.selectionInfo}>
            <span className={styles.selectionCount}>
              {selectedRequests.length}{' '}
              {selectedRequests.length === 1 ? 'request' : 'requests'} selected
            </span>
            <button
              className={styles.clearButton}
              onClick={onClearSelection}
              disabled={isLoading}
            >
              <X size={16} />
              Clear selection
            </button>
          </div>
        </div>

        <div className={styles.controls}>
          {!showNewProject ? (
            <>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className={styles.select}
                disabled={isLoading}
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>

              <button
                className={styles.addButton}
                onClick={() => setShowNewProject(true)}
                disabled={isLoading}
              >
                <Plus size={16} />
                Create New Project
              </button>
            </>
          ) : (
            <form
              onSubmit={handleCreateProject}
              className={styles.newProjectForm}
            >
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name"
                className={styles.input}
                disabled={isLoading}
                autoFocus
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                <FolderPlus size={16} />
                {isLoading ? 'Creating...' : 'Create & Group'}
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowNewProject(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
            </form>
          )}

          {!showNewProject && (
            <button
              className={styles.groupButton}
              onClick={handleGroup}
              disabled={
                !selectedProjectId || selectedRequests.length === 0 || isLoading
              }
            >
              <FolderPlus size={16} />
              {isLoading ? 'Grouping...' : 'Group into Project'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestGroupingToolbar;
