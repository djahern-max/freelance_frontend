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
  const [conversations, setConversations] = useState([]);
  const [agreements, setAgreements] = useState([]);

  const fetchProject = useCallback(async () => {
    try {
      const projectResponse = await api.get(`/projects/${projectId}`);
      setProject(projectResponse.data);

      const requestsResponse = await api.get(
        `/requests/?project_id=${projectId}&include_shared=true&skip=0&limit=10`
      );
      setRequests(requestsResponse.data);

      // Fetch conversations related to the project
      const conversationsResponse = await api.get(
        `/conversations/user/list?project_id=${projectId}`
      );
      setConversations(conversationsResponse.data);

      // Fetch agreements related to the project's requests
      const agreementsPromises = requestsResponse.data.map(
        (request) =>
          api
            .get(`/agreements/request/${request.id}`)
            .then((response) => response.data)
            .catch(() => null) // If no agreement exists, return null
      );
      const agreementsResults = await Promise.all(agreementsPromises);
      setAgreements(
        agreementsResults.filter((agreement) => agreement !== null)
      );

      setError(null);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setError('Failed to load project details');
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
        <button
          className={styles.backButton}
          onClick={() => navigate('/client-dashboard')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {error && <div className={styles.error}>{error}</div>}

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
              <p>{conversations.length}</p>
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

        <div className={styles.quickActions}>
          <button
            className={styles.primaryButton}
            onClick={() => setShowRequestModal(true)}
          >
            <Plus size={16} />
            New Request
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => navigate('/creators')}
          >
            <Users size={16} />
            Search for Team Members
          </button>
        </div>

        {showRequestModal && (
          <CreateRequestModal
            projectId={projectId}
            onClose={() => setShowRequestModal(false)}
            onSubmit={handleCreateRequest}
          />
        )}

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
            {/* <button
              className={`${styles.tabButton} ${
                activeTab === 'agreements' ? styles.activeTab : ''
              }`}
              onClick={() => setActiveTab('agreements')}
            >
              Terms of Agreement
            </button> */}
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
            {/* Replace the conversations tab content with this */}
            {activeTab === 'conversations' && (
              <div className={styles.conversationsTab}>
                {conversations.length > 0 ? (
                  <div className={styles.conversationsList}>
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={styles.conversationCard}
                      >
                        <div className={styles.conversationHeader}>
                          <h3 className={styles.conversationTitle}>
                            {conversation.request_title ||
                              `Conversation #${conversation.id}`}
                          </h3>
                          <button
                            className={styles.viewButton}
                            onClick={() =>
                              navigate(`/conversations/${conversation.id}`)
                            }
                          >
                            <MessageSquare size={14} />
                            View Conversation
                          </button>
                        </div>
                        <div className={styles.conversationMeta}>
                          <span className={styles.metaItem}>
                            <Clock size={14} />
                            Last updated:{' '}
                            {conversation.messages?.length > 0
                              ? new Date(
                                  conversation.messages[
                                    conversation.messages.length - 1
                                  ].created_at
                                ).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })
                              : 'Not yet updated'}
                          </span>
                          <span className={styles.metaItem}>
                            <MessageSquare size={14} />
                            {conversation.messages?.length || 0} messages
                          </span>
                        </div>
                        {conversation.messages?.length > 0 && (
                          <p className={styles.lastMessage}>
                            Latest:{' '}
                            {
                              conversation.messages[
                                conversation.messages.length - 1
                              ].content
                            }
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <MessageSquare size={48} />
                    <h3>No Conversations Yet</h3>
                    <p>Conversations will appear here once started</p>
                  </div>
                )}
              </div>
            )}

            {/* Replace the agreements tab content with this */}
            {activeTab === 'agreements' && (
              <div className={styles.agreementsTab}>
                {agreements.length > 0 ? (
                  <div className={styles.agreementsList}>
                    {agreements.map((agreement) => (
                      <div key={agreement.id} className={styles.agreementCard}>
                        <div className={styles.agreementHeader}>
                          <h3 className={styles.agreementTitle}>
                            {agreement.request_title || 'Untitled Request'}
                          </h3>
                          <span
                            className={`${styles.status} ${
                              styles[agreement.status]
                            }`}
                          >
                            {agreement.status}
                          </span>
                        </div>
                        <div className={styles.agreementMeta}>
                          <span className={styles.metaItem}>
                            <Clock size={14} />
                            Due: {agreement.terms}
                          </span>
                          {agreement.price && (
                            <span className={styles.metaItem}>
                              <FileText size={14} />
                              Price: ${agreement.price}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <FileText size={48} />
                    <h3>No Agreements Yet</h3>
                    <p>Agreements will appear here once created</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
