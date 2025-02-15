import {
  Briefcase,
  Clock,
  FolderOpen,
  Inbox,
  Plus,
  Share2,
  User,
} from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import ProjectDashboardCard from '../projects/ProjectDashboardCard';
import CreateRequestModal from '../requests/CreateRequestModal';
import ProjectHandler from '../requests/ProjectHandler';
import RequestCard from '../requests/RequestCard';
import RequestGroupingToolbar from '../requests/RequestGroupingToolbar';
// import FeatureTour from '../shared/FeatureTour';
import Header from '../shared/Header';
import styles from './ClientDashboard.module.css';
import DashboardSections from './DashboardSections';
import axios from 'axios';


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
  // const [showFeatureTour, setShowFeatureTour] = useState(true);

  const sections = [
    {
      id: 'opportunities',
      icon: Briefcase,
      title: 'My Tickets',
      count: dashboardData.requests.length,
    },
    {
      id: 'conversations',
      icon: Inbox,
      title: 'Inbox',
      count: dashboardData.conversations.length,
    },
    {
      id: 'sharedRequests',
      icon: Share2,
      title: 'Shared',
      count: dashboardData.sharedRequests.length,
    },
    {
      id: 'projects',
      icon: FolderOpen,
      title: 'Projects',
      count: projects.length,
    },
  ];

  const controllersRef = useRef({});

  const createController = (key) => {
    // Cancel existing request
    if (controllersRef.current[key]) {
      controllersRef.current[key].abort();
    }
    // Create new controller
    const controller = new AbortController();
    controllersRef.current[key] = controller;
    return controller;
  };

  useEffect(() => {
    return () => {
      Object.values(controllersRef.current).forEach(controller => {
        if (controller) {
          controller.abort();
        }
      });
      controllersRef.current = {};
    };
  }, []);

  const fetchProjects = useCallback(async () => {
    const controller = createController('projects');
    try {
      const response = await api.get('/projects/', {
        signal: controller.signal
      });
      setProjects(response.data);
      setErrors((prev) => ({ ...prev, projects: null }));
    } catch (error) {
      if (error.message !== 'REQUEST_CANCELLED') {
        console.error('Error fetching projects:', error);
        setErrors((prev) => ({ ...prev, projects: 'Failed to load projects' }));
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, projects: false }));
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    const controller = createController('requests');
    try {
      setLoadingStates(prev => ({ ...prev, requests: true }));

      // Get token directly
      const token = localStorage.getItem('token');

      // Make request exactly like the working CURL
      const response = await axios.get('http://localhost:8000/requests/', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });

      if (response.data) {
        const sortedRequests = [...response.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setDashboardData(prev => ({
          ...prev,
          requests: sortedRequests,
        }));
      }
    } catch (error) {
      if (error.message !== 'REQUEST_CANCELLED') {
        console.error('Error fetching requests:', error);
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, requests: false }));
    }
  }, []);

  const handleCreateRequest = useCallback(async (formData) => {
    const controller = createController('createRequest');
    try {
      const response = await api.post('/requests/', formData, {
        signal: controller.signal
      });
      await fetchRequests();
      setShowCreateModal(false);
      toast.success('Request created successfully');
      return response.data;
    } catch (error) {
      if (error.message !== 'REQUEST_CANCELLED') {
        console.error('Error creating request:', error);
        toast.error(error.response?.data?.detail || 'Failed to create request');
      }
      throw error;
    }
  }, [fetchRequests]);

  const fetchSharedRequests = useCallback(async () => {
    const controller = createController('sharedRequests');
    try {
      setLoadingStates((prev) => ({ ...prev, sharedRequests: true }));

      const requestsResponse = await api.get('/requests/', {
        signal: controller.signal
      });
      const uniqueRequestsMap = new Map();

      await Promise.all(
        requestsResponse.data.map(async (request) => {
          try {
            const sharesResponse = await api.get(
              `/requests/${request.id}/shares/users`,
              { signal: controller.signal }
            );
            const sharedUsers = sharesResponse.data;

            if (sharedUsers && sharedUsers.length > 0) {
              uniqueRequestsMap.set(request.id, {
                ...request,
                sharedWith: sharedUsers,
              });
            }
          } catch (error) {
            if (error.message !== 'REQUEST_CANCELLED') {
              console.error(
                `Error fetching shares for request ${request.id}:`,
                error
              );
            }
          }
        })
      ); // Promise.all ends here

      const validSharedRequests = Array.from(uniqueRequestsMap.values());

      setDashboardData((prev) => ({
        ...prev,
        sharedRequests: validSharedRequests,
      }));
      setErrors((prev) => ({ ...prev, sharedRequests: null }));
    } catch (error) {
      if (error.message !== 'REQUEST_CANCELLED') {
        console.error('Shared requests fetch failed:', error);
        setErrors((prev) => ({
          ...prev,
          sharedRequests: 'Unable to load shared requests',
        }));
      }
    } finally {
      setLoadingStates((prev) => ({ ...prev, sharedRequests: false }));
    }
  }, []); // useCallback's dependency array goes here, outside the entire function


  const fetchConversations = useCallback(async () => {
    const controller = createController('conversations');
    try {
      const response = await api.get('/conversations/user/list', {
        signal: controller.signal
      });
      const conversations = Array.isArray(response.data) ? response.data : [];

      setDashboardData(prev => ({
        ...prev,
        conversations: conversations
      }));
      setErrors(prev => ({ ...prev, conversations: null }));
    } catch (error) {
      if (error.message !== 'REQUEST_CANCELLED') {
        console.error('Conversations fetch failed:', error);
        setErrors(prev => ({
          ...prev,
          conversations: 'Unable to load conversations. Please try again later.'
        }));
      }
    } finally {
      setLoadingStates(prev => ({ ...prev, conversations: false }));
    }
  }, []);

  const fetchDashboardData = useCallback(async () => {
    console.log('Fetching dashboard data...');
    await Promise.all([
      fetchRequests(),
      fetchConversations(),
      fetchProjects(),
      fetchSharedRequests()
    ]);
    console.log('All data fetched');
  }, [fetchRequests, fetchConversations, fetchProjects, fetchSharedRequests]);

  // 3. Use a single useEffect for data fetching
  useEffect(() => {
    console.log('Dashboard effect running...');
    if (!user || user.userType !== 'client') {
      console.log('User not client or not logged in');
      return;
    }

    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchDashboardData();
        console.log('Dashboard data loaded');
      }
    };

    loadData();

    // Cleanup function
    return () => {
      mounted = false;
      // Cancel any pending requests
      Object.values(controllersRef.current).forEach(controller => {
        if (controller) {
          controller.abort();
        }
      });
    };
  }, [user, fetchDashboardData]);

  // 4. Add a debug effect to monitor state changes
  useEffect(() => {
    console.log('Dashboard data changed:', dashboardData);
  }, [dashboardData]);


  useEffect(() => {
    if (!user || user.userType !== 'client') {
      return;
    }

    let mounted = true;
    const loadInitialData = async () => {
      if (mounted) {
        await fetchDashboardData();
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
      // Clean up any pending requests
      Object.values(controllersRef.current).forEach(controller => {
        controller.abort();
      });
    };
  }, [user, fetchDashboardData]);


  const formatTimeSince = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString('en-US');
  };

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
                {dashboardData.conversations.map((conversation) => {
                  const otherUser =
                    user.id === conversation.starter_user_id
                      ? conversation.recipient_username
                      : conversation.starter_username;

                  const otherUserRole =
                    user.id === conversation.starter_user_id
                      ? 'Developer'
                      : 'Client';

                  return (
                    <div
                      key={conversation.id}
                      className={styles.conversationCard}
                      onClick={() =>
                        navigate(`/conversations/${conversation.id}`)
                      }
                    >
                      <div className={styles.conversationRow}>
                        <div className={styles.titleSection}>
                          <span className={styles.requestTitle}>
                            {conversation.request_title || 'Untitled Request'}
                          </span>
                          <span
                            className={`${styles.status} ${styles[conversation.status]
                              }`}
                          >
                            {conversation.status || 'active'}
                          </span>
                        </div>

                        <div className={styles.userSection}>
                          <User className={styles.iconUser} />
                          <span className={styles.participantInfo}>
                            {otherUser} ({otherUserRole})
                          </span>
                        </div>

                        <div className={styles.messageSection}>
                          <Inbox className={styles.iconMessage} />
                          <span className={styles.messageCount}>
                            {conversation.messages?.length || 0} messages
                          </span>
                        </div>

                        <div className={styles.timeSection}>
                          <Clock className={styles.iconTime} />
                          <span className={styles.timeInfo}>
                            Last message:{' '}
                            {formatTimeSince(
                              conversation.updated_at || conversation.created_at
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
            <h2>Tickets I've Shared</h2>
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
                <p>You haven't shared any tickets yet</p>
                <p>
                  Share your tickets with developers you'd like to work with
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



    try {
      const projectData = {
        name: String(projectName).trim(),
        description: `Project created from ${selectedRequests.length} requests`,
      };



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
        `Project "${projectData.name}" created successfully with ${selectedRequests.length} requests.`,
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
      {console.log('Current requests:', dashboardData.requests)}
      {dashboardData.requests.length > 0 && (
        <div className={styles.groupingInfo}>
          <span className={styles.groupingMessage}>
            Group Requests into Projects with the Checkbox
          </span>
        </div>
      )}
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


  // Replace the current return statement with this
  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>
            Loading your dashboard...
            <div>
              Requests: {loadingStates.requests ? 'Loading' : 'Done'}
              Projects: {loadingStates.projects ? 'Loading' : 'Done'}
              Conversations: {loadingStates.conversations ? 'Loading' : 'Done'}
              Shared: {loadingStates.sharedRequests ? 'Loading' : 'Done'}
            </div>
          </div>
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
            <Plus className={styles.buttonIcon} />
            Create Ticket
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
            creatorId={user.id} // Add this
            creatorUsername={user.username} // Add this
          />
        )}


      </div>
    </div>
  );
};

export default ClientDashboard;
