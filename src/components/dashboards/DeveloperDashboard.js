import {
  Bell,
  Bookmark,
  Briefcase,
  Clock,
  MessageSquare,
  Plus,
  Share2,
  User,
} from 'lucide-react';

import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

import Header from '../shared/Header';
import DashboardSections from './DashboardSections';
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
      className={`${styles.requestCard} ${request.is_new ? styles.newRequest : ''
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
          Start Conversation  DEVELOPER DASHBOARD TEST
        </button>
      </div>
    </div>
  );
};

const ConversationCard = ({ conversation, navigate, user }) => {
  const formatTimeSince = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    const now = new Date();
    if (isNaN(date.getTime())) return 'Invalid date';
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Add safety checks for user determination
  const otherUser =
    user && conversation
      ? user.id === conversation.starter_user_id
        ? conversation.recipient_username
        : conversation.starter_username
      : 'Unknown User';

  const otherUserRole =
    user && conversation
      ? user.id === conversation.starter_user_id
        ? 'Client'
        : 'Developer'
      : 'Unknown Role';

  return (
    <div
      className={styles.conversationCard}
      onClick={() => navigate(`/conversations/${conversation.id}`)}
    >
      <div className={styles.conversationRow}>
        <div className={styles.titleSection}>
          <span className={styles.requestTitle}>
            {conversation?.request_title || 'Untitled Request'}
          </span>
          <span className={styles.status}>
            {conversation?.status || 'active'}
          </span>
        </div>

        <div className={styles.userSection}>
          <User className={styles.iconUser} />
          <span className={styles.participantInfo}>
            {otherUser} ({otherUserRole})
          </span>
        </div>

        <div className={styles.messageSection}>
          <MessageSquare className={styles.iconMessage} />
          <span className={styles.messageCount}>
            {conversation?.messages?.length || 0} messages
          </span>
        </div>

        <div className={styles.timeSection}>
          <Clock className={styles.iconTime} />
          <span className={styles.timeInfo}>
            Last message:{' '}
            {formatTimeSince(
              conversation?.last_activity ||
              conversation?.updated_at ||
              conversation?.created_at
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

const DeveloperDashboard = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [sharedRequests, setSharedRequests] = useState([]);
  const [snaggedRequests, setSnaggedRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('dashboardTutorialSeen') === 'true';
  });
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);  // Fixed this line
  const [pendingNavigation, setPendingNavigation] = useState('');


  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);

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



  // Now define sections after activeProjects is defined
  const sections = [
    {
      id: 'opportunities',
      icon: Briefcase,
      title: 'New Opportunities',
      count: activeRequests.length,
    },
    {
      id: 'conversations',
      icon: MessageSquare,
      title: 'Conversations',
      count: conversations.length,
    },
    {
      id: 'sharedRequests',
      icon: Share2,
      title: 'Assigned to You',
      count: sharedRequests.length,
    },
    {
      id: 'snagged', // Add this new section
      icon: Bookmark,
      title: 'Watch List',
      count: snaggedRequests.length, // You'll need to add this state
    },
  ];

  // Add this render function
  const renderSection = (sectionId) => {
    switch (sectionId) {
      case 'opportunities':
        return (
          <div className={styles.recentActivity}>
            <h2>New Requests</h2>
            {activeRequests.length === 0 ? (
              <div className={styles.emptyState}>
                <Briefcase className={styles.emptyStateIcon} />
                <p>No public requests available at the moment.</p>
                <p>Check back later for new opportunities!</p>
              </div>
            ) : (
              <div className={styles.requestsList}>
                {activeRequests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    navigate={navigate}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case 'conversations':
        return (
          <div className={styles.expandedSection}>
            <h2>Conversations:</h2>
            {conversations.length > 0 ? (
              <div className={styles.conversationGrid}>
                {conversations.map((conversation) => (
                  <ConversationCard
                    key={conversation.id}
                    conversation={conversation}
                    navigate={navigate}
                    user={user} // Make sure you're passing the user here
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
        );
      case 'sharedRequests':
        return (
          <div className={styles.expandedSection}>
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
                <p>There haven't been any requests shared with you yet</p>
                <p>
                  Requests will appear here when clients share them with you
                </p>
              </div>
            )}
          </div>
        );


      case 'snagged':
        return (
          <div className={styles.expandedSection}>
            <h2>Your Watchlist</h2>
            {snaggedRequests.length > 0 ? (
              <div className={styles.requestsList}>
                {snaggedRequests.map((item) => (
                  <div key={item.id} className={styles.requestCard}>
                    <div className={styles.requestHeader}>
                      <h3>{item.request.title}</h3>
                      <span className={styles.statusBadge}>open</span>
                    </div>
                    <p className={styles.requestContent}>
                      {item.request.content.length > 150
                        ? `${item.request.content.substring(0, 150)}...`
                        : item.request.content}
                    </p>
                    <div className={styles.requestMeta}>
                      <span className={styles.budget}>
                        Budget: ${item.request.estimated_budget}
                      </span>
                      <span className={styles.userLabel}>
                        User: {item.request.owner_username}
                      </span>
                    </div>
                    <div className={styles.buttonContainer}>
                      <button
                        className={styles.button}
                        onClick={() => navigate(`/requests/${item.request.id}`)}
                      >
                        View Details
                      </button>
                      <button
                        className={`${styles.button} ${styles.removeButton}`}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await api.delete(
                              `/snagged-requests/${item.request.id}`
                            );
                            setSnaggedRequests((prevRequests) =>
                              prevRequests.filter((req) => req.id !== item.id)
                            );
                          } catch (error) {
                            console.error(
                              'Error removing snagged request:',
                              error
                            );
                          }
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <Bookmark className={styles.emptyStateIcon} />
                <p>No items added to watchlist yet</p>
                <p>When connect to with a potential client and share your credentials the ticket will appear here</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const markShareViewed = async (shareId) => {
    try {
      await api.post(`/requests/shared-with-me/${shareId}/mark-viewed`);
    } catch (error) {
      console.error('Error marking share as viewed:', error);
    }
  };



  const fetchDashboardData = useCallback(async () => {
    try {
      // Get conversations
      const conversationsRes = await api.get('/conversations/user/list');
      let conversations = Array.isArray(conversationsRes.data)
        ? conversationsRes.data
        : [];

      // Get additional details for each conversation
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          try {
            // Get messages for this conversation
            const messagesRes = await api.get(
              `/conversations/${conv.id}/messages`
            );

            return {
              ...conv,
              messages: messagesRes.data,
            };
          } catch (err) {
            console.error(
              `Error fetching details for conversation ${conv.id}:`,
              err
            );
            return conv;
          }
        })
      );

      // Extract request IDs from conversations
      const requestIds = conversationsWithDetails.map(
        (conv) => conv.request_id
      );

      if (requestIds.length > 0) {
        // Get projects
        const projectsRes = await api.get('/projects/');
        const projects = Array.isArray(projectsRes.data) ? projectsRes.data : [];

        // Map conversations with projects only
        const updatedConversations = conversationsWithDetails.map((conversation) => {
          // Find matching project
          const relatedProject = projects.find(
            (p) => p.request_id === conversation.request_id
          );
          return {
            ...conversation,
            project_id: relatedProject?.id,
          };
        });

        setConversations(updatedConversations);
      } else {
        setConversations([]);
      }

      // Fetch public requests
      const requestsRes = await api.get('/requests/public');
      const sortedRequests = requestsRes.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      setActiveRequests(sortedRequests);

      // Fetch shared requests if user is a developer
      const sharedRequestsRes =
        user.userType === 'developer'
          ? await api.get('/requests/shared-with-me')
          : { data: [] };

      setSharedRequests(
        user.userType === 'developer' ? sharedRequestsRes.data || [] : []
      );

      // Fetch snagged requests if user is a developer
      if (user.userType === 'developer') {
        try {
          const snaggedRequestsRes = await api.get('/snagged-requests/');
          setSnaggedRequests(snaggedRequestsRes.data || []);
        } catch (err) {
          console.error('Error fetching snagged requests:', err);
          setSnaggedRequests([]);
        }
      }

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
  }, [user?.userType, navigate, auth.token]);





  useEffect(() => {
    if (auth.token) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 30000);
      return () => clearInterval(interval);
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, [auth.token, fetchDashboardData]);

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
      // Create conversation directly without subscription check
      const response = await api.post('/conversations/', {
        request_id: request.id,
      });
      await markShareViewed(request.share_id);
      navigate(`/conversations/${response.data.id}`);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const handleSubscriptionDialogClose = () => {
    setShowSubscriptionDialog(false);
    setPendingRequest(null);
    localStorage.removeItem('pending_conversation_request_id');
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionDialog(false);
    // Don't start conversation here - it will happen in SubscriptionSuccess component
  };

  const handleShowcaseClick = () => {
    navigate('/showcase/create');
  };






  return (
    <div className={styles.dashboardContainer}>
      <Header />
      {loading ? (
        <div className={styles.loadingState}>Loading dashboard...</div>
      ) : error ? (
        <div className={styles.errorState}>{error}</div>
      ) : (
        <>
          <div className={styles.content}>


            <div className={styles.dashboardHeader}>
              <div className={styles.headerButtons}>
                <button
                  onClick={() => navigate('/opportunities')}
                  className={styles.headerCreateButton}
                >
                  <Plus size={24} className={styles.buttonIcon} />
                  Explore Open Tickets
                </button>

                {/* <button
                  onClick={handleShowcaseClick}
                  className={styles.headerCreateButton}
                >
                  <Plus size={24} className={styles.buttonIcon} />
                  Showcase Project
                </button> */}
              </div>
            </div>
            {/* {!hasSeenTutorial && (
              <div className={styles.tutorialHint}>
                Click any card to view more details
              </div>
            )} */}
            <DashboardSections sections={sections} renderSection={renderSection} />
          </div>


        </>
      )}
    </div>
  );
}

export default DeveloperDashboard;