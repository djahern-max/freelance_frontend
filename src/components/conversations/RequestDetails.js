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
import { toast } from 'react-toastify';
import api from '../../utils/api';
import RequestSharing from '../requests/RequestSharing';
import Header from '../shared/Header';
import styles from './RequestDetails.module.css';

const RequestDetails = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  // const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchRequestDetails = async () => {
      if (requestId === 'new') {
        setLoading(false);
        return;
      }
      try {
        const [requestResponse, conversationsResponse] = await Promise.all([
          api.get(`/requests/${requestId}`, {
            signal: controller.signal
          }),
          api.get('/conversations/user/list', {
            signal: controller.signal
          })
        ]);

        // Only set state if the component is still mounted
        if (!controller.signal.aborted) {
          if (!requestResponse.data) {
            setError('Request not found');
            setLoading(false);
            return;
          }

          setRequest(requestResponse.data);
          const relevantConversations = conversationsResponse.data.filter(
            (conv) => conv.request_id === parseInt(requestId)
          );
          setConversations(relevantConversations);
          setLoading(false);
        }
      } catch (err) {
        // Only set error state if the request wasn't cancelled
        if (err.name === 'AbortError' || err.message === 'REQUEST_CANCELLED') {
          console.log('Request cancelled');
          return;
        }

        console.error('Error fetching request details:', err);
        if (err.response?.status === 404) {
          setError('Request not found');
        } else if (err.response?.status === 403) {
          setError('You do not have permission to view this request');
        } else if (err.response?.status === 401) {
          setError('Please log in to view this request');
          navigate('/login', {
            state: { from: location.pathname }
          });
        } else {
          setError(err.response?.data?.detail || 'Failed to load request details');
        }
        setLoading(false);
      }
    };

    fetchRequestDetails();
    return () => {
      controller.abort();
    };
  }, [requestId, token, apiUrl, navigate, location.pathname]);

  const handleStartConversation = async () => {
    try {
      // Check for existing conversation first
      const existingConversation = conversations.find(
        (conv) =>
          conv.starter_user_id === parseInt(user.id) ||
          conv.recipient_user_id === parseInt(user.id)
      );

      if (existingConversation) {
        navigate(`/conversations/${existingConversation.id}`);
        return;
      }

      // Create conversation with additional metadata for external tickets
      const response = await api.post('/conversations/', {
        request_id: parseInt(requestId),
        is_external_support: request.request_metadata?.ticket_type === "external_support"
      });

      navigate(`/conversations/${response.data.id}`);
    } catch (err) {
      console.error('Error starting conversation:', err);
      setError(err.message || 'Failed to start conversation');
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

  const handleBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.content}>
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeft className={styles.backIcon} />
            Back to Dashboard
          </button>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading request details...</p>
          </div>
        </main>
      </div>
    );
  }

  // Add this right after the first loading check
  if (error) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.content}>
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeft className={styles.backIcon} />
            Back to Dashboard
          </button>
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // Add this check before trying to render request data
  if (!request) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.content}>
          <button className={styles.backButton} onClick={handleBack}>
            <ArrowLeft className={styles.backIcon} />
            Back to Dashboard
          </button>
          <div className={styles.loading}>No request data available</div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.content}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft className={styles.backIcon} />
          Back to Dashboard
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

          {user.id === request.user_id && (
            <div className={styles.sharingSection}>
              <h2>Share This Request</h2>

              {/* Success Message */}
              {successMessage && (
                <div className={styles.successMessage}>{successMessage}</div>
              )}

              <RequestSharing
                requestId={requestId}
                token={token}
                apiUrl={apiUrl}
                request={request}
                onShareComplete={() => {
                  // Re-fetch request details after sharing
                  api.get(`/requests/${requestId}`).then((response) => {
                    setRequest(response.data);
                    setSuccessMessage('Request shared successfully!'); // Set success message

                    // Clear the message after 5 seconds
                    setTimeout(() => setSuccessMessage(''), 5000);
                  });
                }}
                toggleRequestPrivacy={(id, isPublic) => {
                  api.put(`/requests/${id}/privacy`, { is_public: !isPublic })
                    .then(() => {
                      setRequest((prev) => ({
                        ...prev,
                        is_public: !isPublic,
                      }));
                      toast.success(
                        `Request is now ${!isPublic ? 'public' : 'private'}`
                      );
                    })
                    .catch((error) => {
                      console.error('Error toggling privacy:', error);
                      toast.error('Failed to update request privacy');
                      // Revert the state if the API call fails
                      setRequest((prev) => ({
                        ...prev,
                        is_public: isPublic,
                      }));
                    });
                }}
              />
            </div>
          )}
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
                      `/conversations/${conversations.find(
                        (conv) =>
                          conv.starter_user_id === parseInt(user.id) ||
                          conv.recipient_user_id === parseInt(user.id)
                      ).id
                      }`
                    )
                  }
                >
                  Go to Conversation
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
        </div>
      </main>

      {/* <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSuccess={async () => {
          setShowSubscriptionDialog(false);
          // Recheck subscription and try to create conversation
          try {
            const subscriptionCheck = await api.get(
              '/payments/subscription-status'
            );
            if (subscriptionCheck.data?.status === 'active') {
              const response = await api.post('/conversations/', {
                request_id: parseInt(requestId),
              });
              navigate(`/conversations/${response.data.id}`);
            }
          } catch (err) {
            console.error('Failed to verify subscription after payment:', err);
            setError('Failed to verify subscription. Please try again.');
          }
        }}
      /> */}
    </div>
  );
};

export default RequestDetails;
