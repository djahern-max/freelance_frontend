import axios from 'axios';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  MessageSquare,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../shared/Header';
import styles from './RequestDetails.module.css';

const RequestDetails = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      try {
        const [requestResponse, conversationsResponse] = await Promise.all([
          axios.get(`${apiUrl}/requests/${requestId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${apiUrl}/conversations/user/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRequest(requestResponse.data);
        // Filter conversations for this specific request
        const relevantConversations = conversationsResponse.data.filter(
          (conv) => conv.request_id === parseInt(requestId)
        );
        setConversations(relevantConversations);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching request details:', err);
        setError('Failed to load request details');
        setLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId, token, apiUrl]);

  const handleStartConversation = async () => {
    try {
      // Check if there's already an active conversation
      const existingConversation = conversations.find(
        (conv) =>
          conv.starter_user_id === parseInt(user.id) ||
          conv.recipient_user_id === parseInt(user.id)
      );

      if (existingConversation) {
        navigate(`/conversations/${existingConversation.id}`);
        return;
      }

      const response = await axios.post(
        `${apiUrl}/conversations/`,
        { request_id: parseInt(requestId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/conversations/${response.data.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError('Failed to start conversation');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loading}>Loading request details...</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.error}>{error || 'Request not found'}</div>
      </div>
    );
  }

  const handleBack = () => {
    // If we know where the user came from, we can use that
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      // Otherwise, just go back to the previous page
      navigate(-1);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft className={styles.backIcon} />
          Back
        </button>

        <div className={styles.requestCard}>
          <h1 className={styles.title}>{request.title}</h1>

          <div className={styles.metadata}>
            <div className={styles.metaItem}>
              <User className={styles.metaIcon} />
              <span>Posted by {request.owner_username}</span>
            </div>
            <div className={styles.metaItem}>
              <Clock className={styles.metaIcon} />
              <span>{formatDate(request.created_at)}</span>
            </div>
            <div className={styles.metaItem}>
              <MessageSquare className={styles.metaIcon} />
              <span>{conversations.length} Responses</span>
            </div>
          </div>

          <div className={styles.description}>{request.content}</div>

          {user.id !== request.user_id && (
            <div className={styles.actions}>
              {conversations.some(
                (conv) =>
                  conv.starter_user_id === parseInt(user.id) ||
                  conv.recipient_user_id === parseInt(user.id)
              ) ? (
                <button
                  className={styles.viewConversationButton}
                  onClick={() =>
                    navigate(
                      `/conversations/${
                        conversations.find(
                          (conv) =>
                            conv.starter_user_id === parseInt(user.id) ||
                            conv.recipient_user_id === parseInt(user.id)
                        ).id
                      }`
                    )
                  }
                >
                  View Your Conversation
                  <ExternalLink className={styles.linkIcon} />
                </button>
              ) : (
                <button
                  className={styles.startConversationButton}
                  onClick={handleStartConversation}
                >
                  Start Conversation
                  <MessageSquare className={styles.messageIcon} />
                </button>
              )}
            </div>
          )}

          {user.id === request.user_id && conversations.length > 0 && (
            <div className={styles.responsesList}>
              <h2 className={styles.responsesTitle}>Responses</h2>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={styles.responseCard}
                  onClick={() => navigate(`/conversations/${conv.id}`)}
                >
                  <div className={styles.responseHeader}>
                    <span className={styles.responder}>
                      From{' '}
                      {conv.starter_user_id === request.user_id
                        ? conv.recipient_username
                        : conv.starter_username}
                    </span>
                    <span className={styles.responseDate}>
                      {formatDate(conv.created_at)}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className={styles.messagePreview}>
                      {conv.last_message.substring(0, 100)}
                      {conv.last_message.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestDetails;
