import { FileText, FolderOpen, MessageSquare, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import ProjectDashboardCard from '../projects/ProjectDashboardCard';
import CreateRequestModal from '../requests/CreateRequestModal';
import Header from '../shared/Header';
import styles from './ClientDashboard.module.css';
import CollapsibleDashboardCard from './CollapsibleDashboardCard';

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    requests: [],
    conversations: [],
  });
  const [loadingStates, setLoadingStates] = useState({
    requests: true,
    conversations: true,
    projects: true,
  });
  const [errors, setErrors] = useState({
    requests: null,
    conversations: null,
    projects: null,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    fetchRequests();
    fetchConversations();
    fetchProjects();
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setErrors((prev) => ({ ...prev, projects: 'Failed to load projects' }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, projects: false }));
    }
  };

  const handleCreateRequest = async (formData) => {
    try {
      const response = await api.post('/requests/', formData);
      await fetchRequests();
      setShowCreateModal(false);
      toast.success('Request created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating request:', error);
      toast.error(error.response?.data?.detail || 'Failed to create request');
      throw error;
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/');
      setDashboardData((prev) => ({
        ...prev,
        requests: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (error) {
      console.error('Requests fetch failed:', error);
      setErrors((prev) => ({
        ...prev,
        requests: 'Unable to load requests. Please try again later.',
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, requests: false }));
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await api.get('/conversations/user/list');
      setDashboardData((prev) => ({
        ...prev,
        conversations: Array.isArray(response.data) ? response.data : [],
      }));
    } catch (error) {
      console.error('Conversations fetch failed:', error);
      setErrors((prev) => ({
        ...prev,
        conversations: 'Unable to load conversations. Please try again later.',
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, conversations: false }));
    }
  };

  const isLoading = Object.values(loadingStates).some((state) => state);

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.content}>
        <div className={styles.dashboardHeader}>
          <button
            onClick={() => setShowCreateModal(true)}
            className={styles.headerCreateButton} // Changed class name to be more specific
          >
            <Plus size={24} className={styles.buttonIcon} />
            New Request
          </button>
        </div>

        <div className={styles.dashboardContent}>
          {/* Primary Content Section */}
          <div className={styles.mainContent}>
            {/* Requests Section */}
            <CollapsibleDashboardCard
              title="Requests"
              count={dashboardData.requests.length}
              icon={FileText}
              defaultExpanded={true}
            >
              {errors.requests ? (
                <div className={styles.error}>{errors.requests}</div>
              ) : dashboardData.requests.length > 0 ? (
                <div className={styles.itemsList}>
                  {dashboardData.requests.map((request) => (
                    <div
                      key={request.id}
                      className={styles.itemCard}
                      onClick={() => navigate(`/requests/${request.id}`)}
                    >
                      <h4 className={styles.itemTitle}>{request.title}</h4>
                      <p className={styles.itemDescription}>
                        {request.content}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/requests')}
                    className={styles.viewAllButton}
                  >
                    View All Requests
                  </button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>No requests yet</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className={styles.createButton}
                  >
                    <Plus className={styles.buttonIcon} />
                    Create Your First Request
                  </button>
                </div>
              )}
            </CollapsibleDashboardCard>

            {/* Conversations Section */}
            <CollapsibleDashboardCard
              title="Conversations"
              count={dashboardData.conversations.length}
              icon={MessageSquare}
              defaultExpanded={true}
            >
              {errors.conversations ? (
                <div className={styles.error}>{errors.conversations}</div>
              ) : dashboardData.conversations.length > 0 ? (
                <div className={styles.itemsList}>
                  {dashboardData.conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={styles.itemCard}
                      onClick={() =>
                        navigate(`/conversations/${conversation.id}`)
                      }
                    >
                      <h4 className={styles.itemTitle}>
                        {conversation.request?.title || 'Untitled Request'}
                      </h4>
                      <p className={styles.itemDate}>
                        Last updated:{' '}
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <button
                    onClick={() => navigate('/conversations')}
                    className={styles.viewAllButton}
                  >
                    View All Conversations
                  </button>
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p className={styles.emptyText}>No active conversations</p>
                </div>
              )}
            </CollapsibleDashboardCard>
          </div>

          {/* Optional Projects Section */}
          {projects.length > 0 && (
            <CollapsibleDashboardCard
              title="Projects"
              count={projects.length}
              icon={FolderOpen}
              defaultExpanded={true}
            >
              {errors.projects ? (
                <div className={styles.error}>{errors.projects}</div>
              ) : (
                <ProjectDashboardCard projects={projects} />
              )}
            </CollapsibleDashboardCard>
          )}
        </div>

        {showCreateModal && (
          <CreateRequestModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateRequest}
          />
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
