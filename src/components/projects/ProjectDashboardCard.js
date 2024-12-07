import {
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Plus,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProjectDashboardCard.module.css';

const ProjectDashboardCard = ({ projects }) => {
  const [expandedProject, setExpandedProject] = useState(null);
  const navigate = useNavigate();

  const handleProjectClick = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId);
  };

  const getProjectStats = (project) => {
    if (!project.requests)
      return { total: 0, open: 0, inProgress: 0, completed: 0 };

    return {
      total: project.requests.length,
      open: project.requests.filter((r) => r.status === 'open').length,
      inProgress: project.requests.filter((r) => r.status === 'in_progress')
        .length,
      completed: project.requests.filter((r) => r.status === 'completed')
        .length,
    };
  };

  if (!projects?.length) {
    return (
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <FolderOpen className={styles.icon} />
            Projects
          </h2>
          <button
            className={styles.addButton}
            onClick={() => navigate('/create-project')}
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
        <div className={styles.emptyState}>
          <p>
            No projects yet. Group your related requests into projects for
            better organization.
          </p>
          <button
            className={styles.createButton}
            onClick={() => navigate('/create-project')}
          >
            Create Your First Project
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>
          <FolderOpen className={styles.icon} />
          Projects ({projects.length})
        </h2>
        <button
          className={styles.addButton}
          onClick={() => navigate('/create-project')}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      <div className={styles.projectsList}>
        {projects.map((project) => {
          const stats = getProjectStats(project);
          const isExpanded = expandedProject === project.id;

          return (
            <div key={project.id} className={styles.projectItem}>
              <div
                className={styles.projectHeader}
                onClick={() => handleProjectClick(project.id)}
              >
                <div className={styles.projectInfo}>
                  <h3 className={styles.projectName}>{project.name}</h3>
                  <span className={styles.requestCount}>
                    {stats.total} {stats.total === 1 ? 'request' : 'requests'}
                  </span>
                </div>
                <button className={styles.expandButton}>
                  {isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className={styles.projectDetails}>
                  {project.description && (
                    <p className={styles.projectDescription}>
                      {project.description}
                    </p>
                  )}

                  <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Open</span>
                      <span className={styles.statValue}>{stats.open}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>In Progress</span>
                      <span className={styles.statValue}>
                        {stats.inProgress}
                      </span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Completed</span>
                      <span className={styles.statValue}>
                        {stats.completed}
                      </span>
                    </div>
                  </div>

                  {project.requests && project.requests.length > 0 && (
                    <div className={styles.recentRequests}>
                      <h4>Recent Requests</h4>
                      <ul>
                        {project.requests.slice(0, 3).map((request) => (
                          <li key={request.id} className={styles.requestItem}>
                            <span className={styles.requestTitle}>
                              {request.title}
                            </span>
                            <span
                              className={`${styles.requestStatus} ${
                                styles[request.status]
                              }`}
                            >
                              {request.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.projectActions}>
                    <button
                      className={styles.viewButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}`);
                      }}
                    >
                      View Details
                    </button>
                    <button
                      className={styles.settingsButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/projects/${project.id}/settings`);
                      }}
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDashboardCard;
