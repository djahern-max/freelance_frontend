import axios from 'axios';
import {
  Briefcase,
  Clock,
  DollarSign,
  MessageSquare,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';


import Header from '../shared/Header';
import styles from './ConversationsList.module.css';

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  // const [hasSubscription, setHasSubscription] = useState(null);
  // const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);

  // const checkSubscription = async () => {
  //   if (user?.userType !== 'developer') return true;

  //   try {
  //     const response = await api.get('/payments/subscription-status');
  //     setHasSubscription(response.data.status === 'active');
  //     return response.data.status === 'active';
  //   } catch (error) {
  //     console.error('Subscription check failed:', error);
  //     setHasSubscription(false);
  //     return false;
  //   }
  // };

  const formatTimeSince = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // const fetchConversations = async () => {
  //   try {
  //     setLoading(true);
  //     setError('');

  //     if (user?.userType === 'developer' && hasSubscription === null) {
  //       const subscribed = await checkSubscription();
  //       if (!subscribed) {
  //         setShowSubscriptionDialog(true);
  //         setLoading(false);
  //         return;
  //       }
  //     }

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/conversations/user/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const conversationsWithDetails = await Promise.all(
        response.data.map(async (conversation) => {
          try {
            const requestResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/requests/${conversation.request_id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...conversation, requestDetails: requestResponse.data };
          } catch (err) {
            console.error('Error fetching request details:', err);
            return {
              ...conversation,
              requestDetails: { title: 'Unknown Request' },
            };
          }
        })
      );

      setConversations(conversationsWithDetails);
    } catch (err) {
      console.error('Error fetching conversations:', err);

    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (user?.userType === 'developer' && hasSubscription === null) {
  //     checkSubscription();
  //   }
  //   fetchConversations();
  // }, [token, hasSubscription]);

  useEffect(() => {

    fetchConversations();
  }, [token]);

  const getOtherUserName = (conversation) => {
    return user.id === conversation.starter_user_id
      ? conversation.recipient_username
      : conversation.starter_username;
  };

  const getOtherUserRole = (conversation) => {
    return user.userType === 'client' ? 'Developer' : 'Client';
  };

  const getFilteredConversations = () => {
    if (activeFilter === 'all') return conversations;
    return conversations.filter((conv) => conv.status === activeFilter);
  };

  const renderConversationCard = (conversation) => {
    const otherUser = getOtherUserName(conversation);
    const otherUserRole = getOtherUserRole(conversation);
    const requestDetails = conversation.requestDetails;
    const totalMessages = conversation.messages?.length || 0;

    // Calculate time since last message
    const lastMessageTime =
      conversation.messages?.length > 0
        ? new Date(
          conversation.messages[conversation.messages.length - 1].created_at
        )
        : new Date(conversation.created_at);

    const timeSince = formatTimeSince(lastMessageTime);

    return (
      <div
        key={conversation.id}
        className={styles.conversationCard}
        onClick={() => navigate(`/conversations/${conversation.id}`)}
      >
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <h2 className={styles.requestTitle}>{requestDetails.title}</h2>
            <span className={`${styles.status} ${styles[conversation.status]}`}>
              {conversation.status}
            </span>
          </div>

          <div className={styles.userInfo}>
            <User className={styles.icon} />
            <span className={styles.userName}>
              {otherUser} ({otherUserRole})
            </span>
          </div>

          {user.userType === 'developer' && (
            <div className={styles.budgetInfo}>
              <DollarSign className={styles.icon} />
              <span>Budget: ${requestDetails.estimated_budget}</span>
            </div>
          )}

          <div className={styles.timeInfo}>
            <Clock className={styles.icon} />
            <span>Last activity: {timeSince}</span>
          </div>

          <div className={styles.messageStats}>
            <MessageSquare className={styles.icon} />
            <span>{totalMessages} messages total</span>
            {conversation.unread_count > 0 && (
              <span className={styles.unreadBadge}>
                {conversation.unread_count} new
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Conversations</h1>
          {user.userType === 'developer' && (
            <button
              className={styles.browseButton}
              onClick={() => navigate('/opportunities')}
            >
              <Briefcase className={styles.icon} />
              Browse Opportunities
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''
              }`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'active' ? styles.active : ''
              }`}
            onClick={() => setActiveFilter('active')}
          >
            Active
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'pending' ? styles.active : ''
              }`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending
          </button>
          <button
            className={`${styles.filterButton} ${activeFilter === 'completed' ? styles.active : ''
              }`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.conversationsList}>
          {getFilteredConversations().length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare className={styles.emptyIcon} />
              <p className={styles.emptyText}>No conversations found</p>
              {user.userType === 'developer' && (
                <button
                  className={styles.browseButton}
                  onClick={() => navigate('/opportunities')}
                >
                  Browse Opportunities
                </button>
              )}
            </div>
          ) : (
            getFilteredConversations().map(renderConversationCard)
          )}
        </div>
        {/* <SubscriptionDialog
          isOpen={showSubscriptionDialog}
          onClose={() => setShowSubscriptionDialog(false)}
          onSuccess={() => {
            setShowSubscriptionDialog(false);
            fetchConversations();
          }}
        /> */}
      </main>
    </div>
  );
};

export default ConversationsList;
