import {
  Bell,
  Briefcase,
  Clock,
  MessageSquare,
  Plus,
  Share2,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SubscriptionDialog from '../payments/SubscriptionDialog';
import Header from '../shared/Header';
import DashboardSections from './DashboardSections';
import styles from './DeveloperDashboard.module.css';

// RequestCard component remains the same
const RequestCard = ({ request, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const needsTruncation = request.content.length > maxLength;
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

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

const ConversationCard = ({ conversation, navigate, isProject = false }) => {
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

  const handleNavigation = () => {
    if (isProject) {
      navigate(`/agreements/request/${conversation.request_id}`);
    } else {
      navigate(`/conversations/${conversation.id}`);
    }
  };

  // In DeveloperDashboard.js - ConversationCard component
  // if (isProject) {
  //   const lastMessage =
  //     conversation.messages?.[conversation.messages.length - 1];

  //   return (
  //     <div className={styles.projectCard} onClick={handleNavigation}>
  //       <div className={styles.projectHeader}>
  //         <div className={styles.projectTitle}>
  //           <Star size={16} className={styles.projectIcon} />
  //           <span>{conversation.request_title || 'Untitled Project'}</span>
  //         </div>
  //         <div className={styles.projectBadge}>Active Project</div>
  //       </div>

  //       <div className={styles.projectDetails}>
  //         {/* Agreement Status */}
  //         <div className={styles.detailItem}>
  //           <FileText size={14} className={styles.detailIcon} />
  //           <span>Agreement Status: {conversation.agreement_status}</span>
  //         </div>

  //         {/* Last Activity */}
  //         {lastMessage && (
  //           <div className={styles.detailItem}>
  //             <Clock size={14} className={styles.detailIcon} />
  //             <span>
  //               Last activity: {formatTimeSince(lastMessage.created_at)}
  //             </span>
  //           </div>
  //         )}

  //         {/* Participants Count */}
  //         <div className={styles.detailItem}>
  //           <Users size={14} className={styles.detailIcon} />
  //           <span>2 participants</span>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Conversation view
  return (
    <div className={styles.conversationCard} onClick={handleNavigation}>
      {/* Conversation Title */}
      <MessageSquare
        size={16}
        style={{ marginRight: '8px', color: '#4B5563' }}
      />
      <span className={styles.conversationTitle}>
        {conversation.request_title || 'test 2'}
      </span>

      {/* Agreement Status */}
      <div className={styles.agreementStatus}>
        Agreement Status: {conversation.agreement_status || 'No Agreement'}
      </div>

      {/* Last Activity */}
      <div className={styles.lastActivity}>
        <Clock size={14} style={{ marginRight: '4px', color: '#6B7280' }} />
        Last activity:{' '}
        {formatTimeSince(conversation.last_activity || conversation.updated_at)}
      </div>
    </div>
  );
};

const DeveloperDashboard = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [sharedRequests, setSharedRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('dashboardTutorialSeen') === 'true';
  });

  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

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

  // Move this calculation before the sections array
  const activeProjects = conversations.filter(
    (c) => c.agreement_status && c.agreement_status.toLowerCase() === 'accepted'
  );

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
    // {
    //   id: 'projects',
    //   icon: FolderOpen,
    //   title: 'Active Projects',
    //   count: activeProjects.length,
    // },
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
      // case 'projects':
      //   return (
      //     <div className={styles.projects}>
      //       <h2>Active Projects</h2>
      //       {activeProjects.length > 0 ? (
      //         <div className={styles.projectsList}>
      //           {activeProjects.map((project) => (
      //             <ConversationCard
      //               key={project.id}
      //               conversation={project}
      //               navigate={navigate}
      //               isProject={true} // Add this line
      //             />
      //           ))}
      //         </div>
      //       ) : (
      //         <div className={styles.emptyState}>
      //           <Star className={styles.emptyStateIcon} />
      //           <p>No active projects yet.</p>
      //           <p>
      //             Projects will appear here once you've accepted an agreement!
      //           </p>
      //         </div>
      //       )}
      //     </div>
      //   );
      // default:
      //   return null;
    }
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
        // Get agreement statuses for all conversations
        const agreementResponse = await api.get(`/agreements/statuses`, {
          params: {
            request_ids: requestIds.join(','),
          },
        });

        // Get projects
        const projectsRes = await api.get('/projects/');
        const projects = Array.isArray(projectsRes.data)
          ? projectsRes.data
          : [];

        // Map agreement statuses to conversations
        const updatedConversations = conversationsWithDetails.map(
          (conversation) => {
            const agreement = agreementResponse.data.find(
              (status) => status.request_id === conversation.request_id
            );
            // Find matching project
            const relatedProject = projects.find(
              (p) => p.request_id === conversation.request_id
            );
            return {
              ...conversation,
              agreement_status: agreement ? agreement.status : 'No Agreement',
              project_id: relatedProject?.id, // Add project ID to conversation data
            };
          }
        );

        setConversations(updatedConversations);
      } else {
        setConversations([]);
      }

      // Fetch other data...
      const requestsRes = await api.get('/requests/public');
      const sortedRequests = requestsRes.data
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);

      setActiveRequests(sortedRequests);

      const sharedRequestsRes =
        user.userType === 'developer'
          ? await api.get('/requests/shared-with-me')
          : { data: [] };

      setActiveRequests(requestsRes.data || []);
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
      // First check subscription status
      const subscriptionResponse = await api.get(
        '/payments/subscription-status'
      );

      if (subscriptionResponse.data.status === 'active') {
        // If subscribed, create conversation
        const response = await api.post('/conversations/', {
          request_id: request.id,
        });
        await markShareViewed(request.share_id);
        navigate(`/conversations/${response.data.id}`);
      } else {
        // If not subscribed, show subscription dialog
        setPendingRequest(request);
        localStorage.setItem('pending_conversation_request_id', request.id);
        setShowSubscriptionDialog(true);
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      if (error.response?.status === 403) {
        // Show subscription dialog if not subscribed
        setPendingRequest(request);
        localStorage.setItem('pending_conversation_request_id', request.id);
        setShowSubscriptionDialog(true);
      } else {
        // Handle other errors
        console.error('Unexpected error:', error);
      }
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

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.content}>
        <div className={styles.dashboardHeader}>
          <button
            onClick={() => navigate('/opportunities')}
            className={styles.headerCreateButton}
          >
            <Plus size={24} className={styles.buttonIcon} />
            Explore Open Tickets
          </button>
        </div>

        {!hasSeenTutorial && (
          <div className={styles.tutorialHint}>
            Click any card to view more details
          </div>
        )}
        <DashboardSections sections={sections} renderSection={renderSection} />
      </div>

      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={handleSubscriptionDialogClose}
        onSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
};

export default DeveloperDashboard;
