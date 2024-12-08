import {
  Briefcase,
  FolderOpen,
  MessageSquare,
  Plus,
  Share2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import ProjectDashboardCard from '../projects/ProjectDashboardCard';
import CreateRequestModal from '../requests/CreateRequestModal';
import Header from '../shared/Header';
import styles from './ClientDashboard.module.css';

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    requests: [],
    conversations: [],
    sharedRequests: [], // This will now store requests the client has shared
  });
  const [loadingStates, setLoadingStates] = useState({
    requests: true,
    conversations: true,
    projects: true,
    sharedRequests: true,
  });
  const [errors, setErrors] = useState({
    requests: null,
    conversations: null,
    projects: null,
    sharedRequests: null,
  });
  const [expandedSections, setExpandedSections] = useState({
    opportunities: false,
    conversations: false,
    sharedRequests: false,
    projects: false,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    fetchRequests();
    fetchConversations();
    fetchProjects();
    fetchSharedRequests();
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
  const fetchSharedRequests = async () => {
    try {
      setLoadingStates((prev) => ({ ...prev, sharedRequests: true }));

      // First get all requests owned by the client
      const requestsResponse = await api.get('/requests/');
      const clientRequests = requestsResponse.data;

      // For each request, fetch its shares using the correct endpoint
      const sharedRequestsWithUsers = await Promise.all(
        clientRequests.map(async (request) => {
          try {
            const sharesResponse = await api.get(
              `/requests/${request.id}/shares/users`
            );
            const sharedUsers = sharesResponse.data;

            // Only include requests that have shares
            if (sharedUsers && sharedUsers.length > 0) {
              return {
                ...request,
                sharedWith: sharedUsers,
              };
            }
            return null;
          } catch (error) {
            console.error(
              `Error fetching shares for request ${request.id}:`,
              error
            );
            return null;
          }
        })
      );

      // Filter out null values and empty shares
      const validSharedRequests = sharedRequestsWithUsers.filter(
        (req) => req !== null
      );

      setDashboardData((prev) => ({
        ...prev,
        sharedRequests: validSharedRequests,
      }));
      setErrors((prev) => ({ ...prev, sharedRequests: null }));
    } catch (error) {
      console.error('Shared requests fetch failed:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        'Unable to load shared requests';
      setErrors((prev) => ({
        ...prev,
        sharedRequests: errorMessage,
      }));
      toast.error(errorMessage);
    } finally {
      setLoadingStates((prev) => ({ ...prev, sharedRequests: false }));
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
            className={styles.headerCreateButton}
          >
            <Plus size={24} className={styles.buttonIcon} />
            New Request
          </button>
        </div>

        <div className={styles.statsGrid}>
          <div
            className={`${styles.statCard} ${
              expandedSections.opportunities ? styles.active : ''
            }`}
            onClick={() => toggleSection('opportunities')}
          >
            <Briefcase className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Opportunities</h3>
              <p>{dashboardData.requests.length}</p>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${
              expandedSections.conversations ? styles.active : ''
            }`}
            onClick={() => toggleSection('conversations')}
          >
            <MessageSquare className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Conversations</h3>
              <p>{dashboardData.conversations.length}</p>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${
              expandedSections.sharedRequests ? styles.active : ''
            }`}
            onClick={() => toggleSection('sharedRequests')}
          >
            <Share2 className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Requests I've Shared</h3>
              <p>{dashboardData.sharedRequests.length}</p>
            </div>
          </div>

          <div
            className={`${styles.statCard} ${
              expandedSections.projects ? styles.active : ''
            }`}
            onClick={() => toggleSection('projects')}
          >
            <FolderOpen className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Projects</h3>
              <p>{projects.length}</p>
            </div>
          </div>
        </div>

        {expandedSections.opportunities && (
          <div className={styles.expandedSection}>
            <h2>Opportunities</h2>
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
                    <p className={styles.itemDescription}>{request.content}</p>
                  </div>
                ))}
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
          </div>
        )}

        {expandedSections.conversations && (
          <div className={styles.expandedSection}>
            <h2>Conversations</h2>
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
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No active conversations</p>
              </div>
            )}
          </div>
        )}

        {expandedSections.sharedRequests && (
          <div className={styles.expandedSection}>
            <h2>Requests I've Shared</h2>
            {errors.sharedRequests ? (
              <div className={styles.error}>{errors.sharedRequests}</div>
            ) : dashboardData.sharedRequests.length > 0 ? (
              <div className={styles.itemsList}>
                {dashboardData.sharedRequests.map((request) => (
                  <div
                    key={request.id}
                    className={styles.requestCard}
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    <h4 className={styles.itemTitle}>{request.title}</h4>
                    <p className={styles.itemDescription}>{request.content}</p>
                    <div className={styles.sharedWith}>
                      <span>Shared with: </span>
                      {request.sharedWith.map((user, index) => (
                        <span key={user.id}>
                          {user.username}
                          {index < request.sharedWith.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Share2 className={styles.emptyStateIcon} />
                <p>You haven't shared any requests yet</p>
                <p>
                  Share your requests with developers you'd like to work with
                </p>
              </div>
            )}
          </div>
        )}

        {expandedSections.projects && (
          <div className={styles.expandedSection}>
            <h2>Active Projects</h2>
            {errors.projects ? (
              <div className={styles.error}>{errors.projects}</div>
            ) : projects.length > 0 ? (
              <ProjectDashboardCard projects={projects} />
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No active projects</p>
              </div>
            )}
          </div>
        )}

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
