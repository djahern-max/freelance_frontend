import { Bell, Briefcase, MessageSquare, Share2, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Header from '../shared/Header';
import styles from './DeveloperDashboard.module.css';

// RequestCard component remains the same
const RequestCard = ({ request, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const needsTruncation = request.content.length > maxLength;

  return (
    <div className={styles.requestCard}>
      <h3>{request.title}</h3>
      <p className={styles.requestContent}>
        {isExpanded || !needsTruncation
          ? request.content
          : `${request.content.substring(0, maxLength)}...`}
        {needsTruncation && (
          <button
            className={styles.viewMoreButton}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'View less' : 'View more'}
          </button>
        )}
      </p>
      <div className={styles.requestMeta}>
        {request.estimated_budget && (
          <span>Budget: ${request.estimated_budget}</span>
        )}
        <span>Posted: {new Date(request.created_at).toLocaleDateString()}</span>
      </div>
      <button
        onClick={() => navigate(`/requests/${request.id}`)}
        className={styles.viewButton}
      >
        View Details
      </button>
    </div>
  );
};

// SharedRequestCard component remains the same
const SharedRequestCard = ({ request, onStartConversation, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const needsTruncation = request.content.length > maxLength;

  const handleCardClick = (e) => {
    if (!e.target.closest('button')) {
      onView(request);
    }
  };

  return (
    <div
      className={`${styles.requestCard} ${
        request.is_new ? styles.newRequest : ''
      }`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      <div className={styles.requestHeader}>
        <h3>{request.title}</h3>
        {request.is_new && <Bell className={styles.newIcon} />}
      </div>
      <p className={styles.requestContent}>
        {isExpanded || !needsTruncation
          ? request.content
          : `${request.content.substring(0, maxLength)}...`}
        {needsTruncation && (
          <button
            className={styles.viewMoreButton}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? 'View less' : 'View more'}
          </button>
        )}
      </p>
      <div className={styles.requestMeta}>
        {request.estimated_budget && (
          <span>Budget: ${request.estimated_budget}</span>
        )}
        <span>From: {request.owner_username}</span>
      </div>
      <div
        className={styles.buttonContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={() => onView(request)} className={styles.button}>
          View Details
        </button>
        <button
          onClick={() => onStartConversation(request)}
          className={`${styles.button} ${styles.startChatButton}`}
        >
          <MessageSquare size={16} />
          Start Conversation
        </button>
      </div>
    </div>
  );
};

// Conversation Card Component (New)
const ConversationCard = ({ conversation, navigate }) => {
  return (
    <div className={styles.conversationCard}>
      <h3>{conversation.title || 'Untitled Conversation'}</h3>
      <div className={styles.conversationMeta}>
        <span>Status: {conversation.status}</span>
        <span>
          Last Updated: {new Date(conversation.updated_at).toLocaleDateString()}
        </span>
      </div>
      <button
        onClick={() => navigate(`/conversations/${conversation.id}`)}
        className={styles.viewButton}
      >
        View Conversation
      </button>
    </div>
  );
};

const DeveloperDashboard = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [sharedRequests, setSharedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    opportunities: false,
    conversations: false,
    sharedRequests: false,
    projects: false,
  });
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('dashboardTutorialSeen') === 'true';
  });

  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const markShareViewed = async (shareId) => {
    try {
      await api.post(`/requests/shared-with-me/${shareId}/mark-viewed`);
    } catch (error) {
      console.error('Error marking share as viewed:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Only fetch shared requests if user is a developer
      const promises = [
        api.get('/requests/public'),
        api.get('/conversations/user/list'),
        user.userType === 'developer'
          ? api.get('/requests/shared-with-me')
          : Promise.resolve({ data: [] }),
      ];

      const [requestsRes, conversationsRes, sharedRequestsRes] =
        await Promise.all(promises);

      setActiveRequests(requestsRes.data || []);
      setConversations(conversationsRes.data || []);
      setSharedRequests(
        user.userType === 'developer' ? sharedRequestsRes.data || [] : []
      );
      setError(null);
    } catch (err) {
      console.error('API Error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        navigate('/login');
      } else {
        setError('Unable to load dashboard data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth.token) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, [auth, navigate]);

  useEffect(() => {
    if (!hasSeenTutorial) {
      const timer = setTimeout(() => {
        setHasSeenTutorial(true);
        localStorage.setItem('dashboardTutorialSeen', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial]);

  const startConversation = async (request) => {
    try {
      const response = await api.post('/conversations/', {
        request_id: request.id,
      });
      await markShareViewed(request.share_id);
      navigate(`/conversations/${response.data.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const viewSharedRequest = async (request) => {
    if (!request || !request.id) {
      console.error('Invalid request object:', request);
      return;
    }

    try {
      if (request.share_id) {
        await markShareViewed(request.share_id);
      }
      navigate(`/requests/${request.id}`);
    } catch (error) {
      console.error('Error viewing shared request:', error);
    }
  };

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.content}>
          <div className={styles.error}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeProjects = conversations.filter((c) => c.status === 'accepted');

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.content}>
        <h1 className={styles.dashboardTitle}>
          {user?.fullName ? `${user.fullName}'s Dashboard` : 'Dashboard'}
        </h1>

        {/* Add the tutorial hint here */}
        {!hasSeenTutorial && (
          <div className={styles.tutorialHint}>
            Click any card to view more details
          </div>
        )}

        <div className={styles.statsGrid}>
          <div
            className={`${styles.statCard} ${
              expandedSections.opportunities ? styles.active : ''
            }`}
            onClick={() => toggleSection('opportunities')}
          >
            <Briefcase className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Available Opportunities</h3>
              <p>{activeRequests.length}</p>
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
              <h3>Active Conversations</h3>
              <p>{conversations.length}</p>
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
              <h3>Shared Requests</h3>
              <p>{sharedRequests.length}</p>
            </div>
          </div>
          <div
            className={`${styles.statCard} ${
              expandedSections.projects ? styles.active : ''
            }`}
            onClick={() => toggleSection('projects')}
          >
            <Star className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Projects</h3>
              <p>{activeProjects.length}</p>
            </div>
          </div>
        </div>

        {/* Shared Requests Section */}
        {expandedSections.sharedRequests && (
          <div className={styles.sharedRequests}>
            <h2>Shared Requests</h2>
            {sharedRequests.length > 0 ? (
              <div className={styles.requestsList}>
                {sharedRequests.map((request) => (
                  <SharedRequestCard
                    key={request.id}
                    request={request}
                    onStartConversation={startConversation}
                    onView={viewSharedRequest}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Share2 className={styles.emptyStateIcon} />
                <p>No requests have been shared with you yet.</p>
                <p>
                  When clients share requests with you, they'll appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Active Conversations Section */}
        {expandedSections.conversations && (
          <div className={styles.conversations}>
            <h2>Active Conversations</h2>
            {conversations.length > 0 ? (
              <div className={styles.conversationsList}>
                {conversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    navigate={navigate}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <MessageSquare className={styles.emptyStateIcon} />
                <p>No active conversations yet.</p>
                <p>Start a conversation by responding to a request!</p>
              </div>
            )}
          </div>
        )}

        {/* Active Projects Section */}
        {expandedSections.projects && (
          <div className={styles.projects}>
            <h2>Active Projects</h2>
            {activeProjects.length > 0 ? (
              <div className={styles.projectsList}>
                {activeProjects.map((project) => (
                  <ConversationCard
                    key={project.id}
                    conversation={project}
                    navigate={navigate}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Star className={styles.emptyStateIcon} />
                <p>No active projects yet.</p>
                <p>
                  Projects will appear here once you've accepted an agreement!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Recent Opportunities Section */}
        {expandedSections.opportunities && (
          <div className={styles.recentActivity}>
            <h2>Recent Opportunities</h2>
            {activeRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <Briefcase className={styles.emptyStateIcon} />
                <p>No public requests available at the moment.</p>
                <p>Check back later for new opportunities!</p>
              </div>
            ) : (
              <div className={styles.requestsList}>
                {activeRequests.slice(0, 5).map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;
