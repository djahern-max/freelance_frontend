import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ProjectDashboardCard.module.css';

const ProjectDashboardCard = ({ projects }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.projectsContainer}>
      {projects.map((project) => (
        <div
          key={project.id}
          className={styles.projectCard}
          onClick={() => navigate(`/projects/${project.id}`)}
        >
          <div className={styles.cardContent}>
            {/* Left Section: Project Details */}
            <div className={styles.projectHeader}>
              <h3 className={styles.projectTitle}>
                {project.name || 'Unnamed Project'}
              </h3>
              <p className={styles.projectDescription}>
                {project.description || 'No description provided'}
              </p>
            </div>

            {/* Right Section: Activity and Details */}
            <div className={styles.rightSection}>
              <div className={styles.lastActivity}>
                <Calendar className={styles.iconBlue} />
                <p>
                  Created At:{' '}
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
              <p className={styles.clickMessage}>
                Click to view project details
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectDashboardCard;
