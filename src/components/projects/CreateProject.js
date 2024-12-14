import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectHandler from '../requests/ProjectHandler';
import Alert from '../shared/Alert'; // Add this import
import Header from '../shared/Header';
import styles from './CreateProject.module.css';

const CreateProject = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false); // Changed from success state
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createProject = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await ProjectHandler.createProject({
        name: projectName,
        description,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to create project');
      }

      setShowSuccess(true); // Changed from setSuccess
      setError(null);

      // Clear form
      setProjectName('');
      setDescription('');

      // Show success message briefly before redirecting
      setTimeout(() => {
        navigate('/client-dashboard');
      }, 1500);
    } catch (error) {
      console.error('Project creation error:', error);
      setShowSuccess(false); // Changed from setSuccess
      setError(error.message || 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      {/* Add Alert components here, outside the formWrapper */}
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
          autoClose={false}
        />
      )}
      {showSuccess && (
        <Alert
          type="success"
          message="Project successfully created"
          showRedirectMessage={true}
          duration={1500}
        />
      )}

      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Project</h1>
          <p className={styles.subtitle}>
            Create a new project to manage your requests
          </p>
        </div>

        <form className={styles.form} onSubmit={createProject}>
          <div className={styles.formGroup}>
            <label htmlFor="projectName" className={styles.label}>
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
              rows="4"
              placeholder="Optional project description"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${
              isLoading ? styles.loading : ''
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Project...' : 'Create Project'}
          </button>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate('/client-dashboard')}
            disabled={isLoading}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
