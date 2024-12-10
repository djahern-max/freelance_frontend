// ProjectDashboardCard.js
import { Calendar, DollarSign, FileText, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './ProjectDashboardCard.module.css';

const ProjectDashboardCard = ({ projects }) => {
  const navigate = useNavigate();

  const getProjectMetrics = (project) => {
    return {
      activeRequests: project.request_stats.open,
      completedRequests: project.request_stats.completed,
      totalRequests: project.request_stats.total,
      activeConversations:
        project.conversation_stats.active +
        project.conversation_stats.negotiating,
      totalBudget: project.request_stats.total_budget,
      agreedAmount: project.request_stats.agreed_amount,
      lastActivity: project.last_activity,
      stats: {
        negotiations: project.conversation_stats.negotiating,
        agreements: project.conversation_stats.agreed,
      },
    };
  };

  return (
    <div className={styles.projectsContainer}>
      {projects.map((project) => {
        const metrics = getProjectMetrics(project);

        return (
          <div
            key={project.id}
            className={styles.projectCard}
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            <div className={styles.projectHeader}>
              <h3 className={styles.projectTitle}>
                {project.name || 'Unnamed Project'}
              </h3>
              <p className={styles.projectDescription}>
                {project.description || 'No description provided'}
              </p>
            </div>

            <div className={styles.metricsContainer}>
              <div className={styles.metricsRow}>
                <div className={styles.metricItem}>
                  <FileText className={styles.iconBlue} />
                  <div>
                    <p className={styles.metricLabel}>Active Requests</p>
                    <p className={styles.metricValue}>
                      {metrics.activeRequests}
                    </p>
                  </div>
                </div>

                {metrics.totalBudget > 0 && (
                  <div className={styles.metricItem}>
                    <DollarSign className={styles.iconGreen} />
                    <div>
                      <p className={styles.metricLabel}>Total Budget</p>
                      <p className={styles.metricValue}>
                        {metrics.totalBudget.toLocaleString()}
                      </p>
                      {metrics.agreedAmount > 0 && (
                        <p className={styles.metricSubtext}>
                          ${metrics.agreedAmount.toLocaleString()} agreed
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className={styles.metricItem}>
                  <MessageSquare className={styles.iconPurple} />
                  <div>
                    <p className={styles.metricLabel}>Active Conversations</p>
                    <p className={styles.metricValue}>
                      {metrics.activeConversations}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.bottomSection}>
                <div className={styles.lastActivity}>
                  <Calendar className={styles.iconGray} />
                  <p>
                    Last Activity:{' '}
                    {new Date(metrics.lastActivity).toLocaleDateString()}
                  </p>
                </div>

                <div className={styles.progressSection}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${
                          metrics.totalRequests > 0
                            ? (metrics.completedRequests /
                                metrics.totalRequests) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <p className={styles.progressText}>
                    Progress: {metrics.completedRequests} of{' '}
                    {metrics.totalRequests} tasks completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProjectDashboardCard;
