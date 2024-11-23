// src/components/pages/ProjectDetails.js
import {
  ArrowLeft,
  Clock,
  FileText,
  MessageSquare,
  Plus,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import RequestCard from '../requests/RequestCard';
import Header from '../shared/Header';
import CreateRequestModal from './CreateRequestModal';
import styles from './ProjectDetails.module.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  const fetchProject = useCallback(async () => {
    try {
      const projectResponse = await api.get(`/projects/${projectId}`);
      setProject(projectResponse.data);

      const requestsResponse = await api.get(
        `/requests/?project_id=${projectId}&include_shared=true&skip=0&limit=10`
      );
      setRequests(requestsResponse.data);

      setError(null);
    } catch (error) {
      console.error('Error fetching project or requests:', error);
      setError('Failed to load project details or requests');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleCreateRequest = async (requestData) => {
    try {
      const response = await api.post('/requests/', {
        ...requestData,
        project_id: projectId,
      });
      console.log('Request created:', response.data); // Use response for debugging
      setShowRequestModal(false);
      fetchProject();
      setError(null);
    } catch (error) {
      console.error('Error creating request:', error);
      setError('Failed to create request. Please try again.');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading project details...</div>;
  }

  if (!project) {
    return <div className={styles.error}>Project not found</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        {/* Back Button */}
        <button
          className={styles.backButton}
          onClick={() => navigate('/client-dashboard')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {error && <div className={styles.error}>{error}</div>}

        {/* Project Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FileText className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Requests</h3>
              <p>{requests.filter((req) => req.status === 'open').length}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <MessageSquare className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Conversations</h3>
              <p>0</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <Users className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Team Members</h3>
              <p>{project?.team_members?.length || 1}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <Clock className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Last Activity</h3>
              <p>
                {project?.last_activity
                  ? new Date(project.last_activity).toLocaleDateString()
                  : 'Today'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button
            className={styles.primaryButton}
            onClick={() => setShowRequestModal(true)}
          >
            <Plus size={16} />
            New Request
          </button>
          <button className={styles.secondaryButton}>
            <Users size={16} />
            Invite Team Member
          </button>
        </div>

        {/* Create Request Modal */}
        {showRequestModal && (
          <CreateRequestModal
            projectId={projectId}
            onClose={() => setShowRequestModal(false)}
            onSubmit={handleCreateRequest}
          />
        )}

        {/* Content Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <button
              className={`${styles.tabButton} ${
                activeTab === 'requests' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('requests')}
            >
              Requests
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === 'conversations' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('conversations')}
            >
              Conversations
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === 'timeline' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('timeline')}
            >
              Timeline
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'requests' && (
              <div className={styles.requestsTab}>
                {requests.length > 0 ? (
                  <div className={styles.requestsList}>
                    {requests.map((request) => (
                      <RequestCard
                        key={request.id}
                        request={request}
                        onUpdate={fetchProject}
                      />
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <FileText size={48} />
                    <h3>No Requests Yet</h3>
                    <p>Create your first request to get started</p>
                    <button
                      className={styles.primaryButton}
                      onClick={() => setShowRequestModal(true)}
                    >
                      <Plus size={16} />
                      New Request
                    </button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'conversations' && (
              <div className={styles.conversationsTab}>
                {/* Conversations content */}
                <div className={styles.emptyState}>
                  <MessageSquare size={48} />
                  <h3>No Conversations Yet</h3>
                  <p>Conversations will appear here once started</p>
                </div>
              </div>
            )}
            {activeTab === 'timeline' && (
              <div className={styles.timelineTab}>
                {/* Timeline content */}
                <div className={styles.emptyState}>
                  <Clock size={48} />
                  <h3>Timeline Coming Soon</h3>
                  <p>Project timeline will be available here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
