import { FolderPlus, Info, Plus, X } from 'lucide-react';
import { useState } from 'react';
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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const success = await onCreateProject(newProjectName);
    if (success) {
      setNewProjectName('');
      setShowNewProject(false);
    }
  };

  const handleGroup = () => {
    if (selectedProjectId) {
      onGroup(selectedProjectId);
      setSelectedProjectId('');
    }
  };

  return (
    <div className={styles.toolbarContainer}>
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
            <button className={styles.clearButton} onClick={onClearSelection}>
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
                autoFocus
              />
              <button type="submit" className={styles.submitButton}>
                <FolderPlus size={16} />
                Create & Group
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowNewProject(false)}
              >
                Cancel
              </button>
            </form>
          )}

          {!showNewProject && (
            <button
              className={styles.groupButton}
              onClick={handleGroup}
              disabled={!selectedProjectId || selectedRequests.length === 0}
            >
              <FolderPlus size={16} />
              Group into Project
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestGroupingToolbar;
