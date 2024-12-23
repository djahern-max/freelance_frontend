import { ChevronRight, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Header from '../shared/Header';
import styles from './ProjectsList.module.css';

const ProjectsList = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/projects/');
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.headerSection}>
          <h1 className={styles.title}>Your Projects</h1>
          <button
            className={styles.createButton}
            onClick={() => navigate('/create-project')}
          >
            <Plus size={20} />
            New Project
          </button>
        </div>

        {error ? (
          <div className={styles.error}>
            {error}
            <button onClick={fetchProjects} className={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : (
          <div className={styles.projectsGrid}>
            {projects.length > 0 ? (
              projects.map((project) => (
                <div key={project.id} className={styles.projectCard}>
                  <div className={styles.projectInfo}>
                    <h3>{project.name || 'Unnamed Project'}</h3>
                    <p>{project.description || 'No description'}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className={styles.viewButton}
                  >
                    View Details
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>
                  No projects found. Create your first project to get started!
                </p>
                <button
                  onClick={() => navigate('/create-project')}
                  className={styles.createButton}
                >
                  <Plus size={20} />
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;