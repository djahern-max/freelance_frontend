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
import ProjectHandler from '../requests/ProjectHandler';
import RequestCard from '../requests/RequestCard';
import RequestGroupingToolbar from '../requests/RequestGroupingToolbar';
import Header from '../shared/Header';
import styles from './ClientDashboard.module.css';
import DashboardSections from './DashboardSections';

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    requests: [],
    conversations: [],
    sharedRequests: [],
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
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showGroupingToolbar, setShowGroupingToolbar] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sections = [
    {
      id: 'opportunities',
      icon: Briefcase,
      title: 'Work Requests',
      count: dashboardData.requests.length,
    },
    {
      id: 'conversations',
      icon: MessageSquare,
      title: 'Conversations',
      count: dashboardData.conversations.length,
    },
    {
      id: 'sharedRequests',
      icon: Share2,
      title: "Requests I've Shared",
      count: dashboardData.sharedRequests.length,
    },
    {
      id: 'projects',
      icon: FolderOpen,
      title: 'Active Projects',
      count: projects.length,
    },
  ];

  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'opportunities':
        return renderRequests();

      case 'conversations':
        return (
          <div className={styles.expandedSection}>
            <h2>Conversations:</h2>
            {errors.conversations ? (
              <div className={styles.error}>{errors.conversations}</div>
            ) : dashboardData.conversations.length > 0 ? (
              <div className={styles.conversationGrid}>
                {dashboardData.conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={styles.conversationCard}
                    onClick={() =>
                      navigate(`/conversations/${conversation.id}`)
                    }
                  >
                    <div className={styles.cardContent}>
                      {/* Title Section */}
                      <div className={styles.cardSection}>
                        <MessageSquare className={styles.cardIcon} />
                        <h4 className={styles.cardTitle}>
                          {conversation.request_title || 'Untitled Request'}
                        </h4>
                      </div>

                      {/* Agreement Status Section */}
                      <div className={styles.cardSection}>
                        <Briefcase
                          className={`${styles.cardStatusIcon} ${
                            conversation.agreement_status === 'accepted'
                              ? styles.statusAccepted
                              : conversation.agreement_status === 'negotiating'
                              ? styles.statusNegotiating
                              : styles.statusDefault
                          }`}
                        />
                        <span
                          className={`${
                            conversation.agreement_status === 'accepted'
                              ? styles.statusAccepted
                              : conversation.agreement_status === 'negotiating'
                              ? styles.statusNegotiating
                              : styles.statusDefault
                          }`}
                        >
                          Agreement Status:{' '}
                          {conversation.agreement_status || 'No Agreement'}
                        </span>
                      </div>

                      {/* Date Section */}
                      <div className={styles.cardSection}>
                        <FolderOpen className={styles.cardDateIcon} />
                        <span className={styles.cardDate}>
                          {new Date(conversation.created_at).toLocaleDateString(
                            'en-US'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No active conversations</p>
              </div>
            )}
          </div>
        );

      case 'sharedRequests':
        return (
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
                    <div className={styles.itemTitle}>
                      {request.title}
                      <span className={styles.statusBadge}>
                        {request.status || 'open'}
                      </span>
                    </div>
                    <p className={styles.itemDescription}>{request.content}</p>
                    <div className={styles.metaInfo}>
                      <span className={styles.budget}>
                        Budget: ${request.estimated_budget}
                      </span>
                      <span>
                        Created:{' '}
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.sharedWith}>
                      <span>Shared with: </span>
                      {request.sharedWith.map((user, index) => (
                        <span key={user.id} className={styles.sharedUser}>
                          @{user.username}
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
        );

      case 'projects':
        return (
          <div className={styles.expandedSection}>
            <h2>Active Projects</h2>
            {errors.projects ? (
              <div className={styles.error}>{errors.projects}</div>
            ) : projects.length > 0 ? (
              <ProjectDashboardCard projects={projects} />
            ) : (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>No active projects</p>
                <button
                  onClick={() => navigate('/create-project')}
                  className={styles.createButton}
                >
                  <Plus className={styles.buttonIcon} />
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
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
      const response = await api.get('/projects/'); // Fetch projects from the API
      setProjects(response.data); // Directly use the response data without modifying it
      setErrors((prev) => ({ ...prev, projects: null }));
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

      const requestsResponse = await api.get('/requests/');
      // Create a Map with request ID as key to ensure uniqueness
      const uniqueRequestsMap = new Map();

      await Promise.all(
        requestsResponse.data.map(async (request) => {
          try {
            const sharesResponse = await api.get(
              `/requests/${request.id}/shares/users`
            );
            const sharedUsers = sharesResponse.data;

            if (sharedUsers && sharedUsers.length > 0) {
              uniqueRequestsMap.set(request.id, {
                ...request,
                sharedWith: sharedUsers,
              });
            }
          } catch (error) {
            console.error(
              `Error fetching shares for request ${request.id}:`,
              error
            );
          }
        })
      );

      const validSharedRequests = Array.from(uniqueRequestsMap.values());

      setDashboardData((prev) => ({
        ...prev,
        sharedRequests: validSharedRequests,
      }));
      setErrors((prev) => ({ ...prev, sharedRequests: null }));
    } catch (error) {
      console.error('Shared requests fetch failed:', error);
      setErrors((prev) => ({
        ...prev,
        sharedRequests: 'Unable to load shared requests',
      }));
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
      setErrors((prev) => ({ ...prev, requests: null }));
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
      const conversations = Array.isArray(response.data) ? response.data : [];

      // Extract request IDs from conversations
      const requestIds = conversations.map((conv) => conv.request_id);

      if (requestIds.length > 0) {
        // Only make the call if there are request IDs
        // Change the parameter format
        const agreementResponse = await api.get(`/agreements/statuses`, {
          params: {
            request_ids: requestIds.join(','), // Convert array to comma-separated string
          },
        });

        // Map agreement statuses to conversations
        const agreementStatuses = agreementResponse.data;
        const updatedConversations = conversations.map((conversation) => {
          const agreement = agreementStatuses.find(
            (status) => status.request_id === conversation.request_id
          );
          return {
            ...conversation,
            agreement_status: agreement ? agreement.status : 'No Agreement',
          };
        });

        setDashboardData((prev) => ({
          ...prev,
          conversations: updatedConversations,
        }));
      } else {
        // If no conversations, set empty array
        setDashboardData((prev) => ({
          ...prev,
          conversations: [],
        }));
      }
      setErrors((prev) => ({ ...prev, conversations: null }));
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

  const handleRequestSelection = (requestId) => {
    setSelectedRequests((prev) => {
      const newSelection = prev.includes(requestId)
        ? prev.filter((id) => id !== requestId)
        : [...prev, requestId];

      setShowGroupingToolbar(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleCreateProject = async (projectName) => {
    // If projectName is an object (which happens on the second call), it means we've already created the project
    if (typeof projectName === 'object' && projectName.id) {
      // Project was already created successfully, just return true
      return true;
    }

    console.log('ClientDashboard - projectName type:', typeof projectName);
    console.log('ClientDashboard - projectName value:', projectName);

    try {
      const projectData = {
        name: String(projectName).trim(),
        description: `Project created from ${selectedRequests.length} requests`,
      };

      console.log('ClientDashboard - projectData:', projectData);

      // Create the project
      const projectResult = await ProjectHandler.createProject(projectData);

      if (!projectResult.success) {
        throw new Error(projectResult.error);
      }

      // Only proceed with adding requests if project creation was successful
      await ProjectHandler.addRequestsToProject(
        projectResult.data.id,
        selectedRequests
      );

      toast.success(
        `🎉 Project "${projectData.name}" created successfully with ${selectedRequests.length} requests!`,
        {
          position: 'top-center',
          autoClose: 5000, // stays visible for 5 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );

      setSelectedRequests([]);
      setShowGroupingToolbar(false);
      await fetchProjects();
      return true;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.message || 'Failed to create project');
      return false;
    }
  };
  const handleGroupIntoProject = async (projectId) => {
    try {
      const result = await ProjectHandler.addRequestsToProject(
        projectId,
        selectedRequests
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      toast.success('Requests added to project successfully');
      setSelectedRequests([]);
      setShowGroupingToolbar(false);
      await fetchProjects();
    } catch (error) {
      console.error('Error grouping requests:', error);
      toast.error(error.message || 'Failed to group requests');
    }
  };

  const renderRequests = () => (
    <div className={styles.expandedSection}>
      <h2>Work Requests</h2>
      {showGroupingToolbar && (
        <RequestGroupingToolbar
          selectedRequests={selectedRequests}
          projects={projects}
          onGroup={handleGroupIntoProject}
          onCreateProject={handleCreateProject}
          onClearSelection={() => {
            setSelectedRequests([]);
            setShowGroupingToolbar(false);
          }}
        />
      )}
      {errors.requests ? (
        <div className={styles.error}>{errors.requests}</div>
      ) : dashboardData.requests.length > 0 ? (
        <div className={styles.itemsList}>
          {dashboardData.requests.map((request) => (
            <div key={request.id} className={styles.requestWrapper}>
              <input
                type="checkbox"
                className={styles.requestCheckbox}
                checked={selectedRequests.includes(request.id)}
                onChange={() => handleRequestSelection(request.id)}
              />
              <RequestCard request={request} onUpdate={fetchRequests} />
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
            <Plus size={16} className={styles.buttonIcon} />{' '}
            {/* Reduced from 24 */}
            Create Your First Request
          </button>
        </div>
      )}
    </div>
  );

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

  // Replace the current return statement with this
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

        <DashboardSections
          sections={sections}
          renderSection={renderSection}
          loading={isLoading}
        />

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
