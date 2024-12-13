import axios from 'axios';
import { Clock, Loader, MessageSquare, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import SubscriptionDialog from '../payments/SubscriptionDialog';

import Header from '../shared/Header';
import EmptyState from './EmptyState';
import styles from './PublicRequests.module.css';

const PublicRequests = () => {
  const [publicRequests, setPublicRequests] = useState([]);
  const [conversations, setConversations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const createConversation = async (requestId, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await api.post('/conversations/', {
          request_id: requestId,
        });
        return response.data;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      let retries = 3;
      let publicResponse;

      while (retries > 0) {
        try {
          publicResponse = await axios.get(
            `${
              process.env.REACT_APP_API_URL || 'http://localhost:8000'
            }/requests/public`,
            {
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
            }
          );
          break; // If successful, exit the retry loop
        } catch (err) {
          retries--;
          if (retries === 0) throw err; // If out of retries, throw the error
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
        }
      }

      setPublicRequests(publicResponse.data);

      // Only fetch conversations if user is authenticated
      if (isAuthenticated && user) {
        try {
          const conversationsResponse = await api.get(
            '/conversations/user/list'
          );
          const conversationCounts = conversationsResponse.data.reduce(
            (acc, conv) => {
              acc[conv.request_id] = (acc[conv.request_id] || 0) + 1;
              return acc;
            },
            {}
          );
          setConversations(conversationCounts);
        } catch (convErr) {
          console.warn('Failed to fetch conversations:', convErr);
          // Don't fail the whole operation if conversations fail to load
        }
      }
    } catch (err) {
      const errorMessage =
        err.code === 'ERR_NETWORK'
          ? 'Unable to connect to server. Please check your connection and try again.'
          : err.response?.data?.detail || 'Failed to fetch requests.';

      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds only if authenticated
    let interval;
    if (isAuthenticated) {
      interval = setInterval(fetchData, 30000);
    }
    return () => interval && clearInterval(interval);
  }, [isAuthenticated]);

  const handleRequestClick = (request) => {
    if (!isAuthenticated) {
      setSelectedRequest(request);
      setShowAuthDialog(true);
      return;
    }
    navigate(`/requests/${request.id}`);
  };

  const handleStartConversation = async (request) => {
    try {
      setLoading(true);
      setSelectedRequest(request);

      // Check subscription status first
      try {
        const subscriptionResponse = await api.get(
          '/payments/subscription-status'
        );
        console.log('Subscription status:', subscriptionResponse.data);

        // If no subscription or not active, show subscription dialog immediately
        if (
          !subscriptionResponse.data ||
          subscriptionResponse.data.status !== 'active'
        ) {
          setShowSubscriptionDialog(true);
          return; // Exit early
        }
      } catch (subError) {
        // If there's any error checking subscription, assume no subscription
        console.error('Error checking subscription:', subError);
        setShowSubscriptionDialog(true);
        return; // Exit early
      }

      // Only proceed with conversation creation if we get here (meaning active subscription)
      try {
        const conversationData = await createConversation(request.id);
        navigate(`/conversations/${conversationData.id}`);
      } catch (convError) {
        // Still handle 403 as backup in case subscription status changed
        if (convError.response?.status === 403) {
          setShowSubscriptionDialog(true);
          return;
        }
        throw convError;
      }
    } catch (err) {
      console.error('Operation failed:', err);
      setError(err.response?.data?.detail || 'Failed to start conversation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.spinner} />
        <p>Loading requests...</p>
      </div>
    );
  }

  const toggleCardExpansion = (requestId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [requestId]: !prev[requestId],
    }));
  };

  return (
    <div className={styles.mainContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.headerContainer}>
          {!isAuthenticated && <p className={styles.subtitle}></p>}
        </div>

        {error && (
          <div className={styles.alert} role="alert">
            <div className={styles.alertContent}>
              <span>{error}</span>
              <button className={styles.retryButton} onClick={fetchData}>
                Try Again
              </button>
            </div>
          </div>
        )}
        {publicRequests.length === 0 ? (
          <EmptyState
            isAuthenticated={isAuthenticated}
            userType={user?.userType}
            onCreateProject={() => navigate('/create-project')}
            onSignUp={() => setShowAuthDialog(true)}
          />
        ) : (
          <div className={styles.requestsGrid}>
            {publicRequests.map((request) => (
              <div
                key={request.id}
                className={styles.requestCard}
                onClick={() => handleRequestClick(request)}
                data-expanded={expandedCards[request.id]}
              >
                <div className={styles.cardHeader}>
                  <h2 className={styles.requestTitle}>{request.title}</h2>
                  {request.estimated_budget && (
                    <div className={styles.budget}>
                      <span>${request.estimated_budget.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className={styles.description}>
                  {request.content.length > 200 &&
                  !expandedCards[request.id] ? (
                    <>
                      {request.content.substring(0, 200)}
                      <span className={styles.fade} />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardExpansion(request.id);
                        }}
                        className={styles.readMoreButton}
                      >
                        Read More
                      </button>
                    </>
                  ) : (
                    <>
                      {request.content}
                      {request.content.length > 200 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCardExpansion(request.id);
                          }}
                          className={styles.readMoreButton}
                        >
                          Show Less
                        </button>
                      )}
                    </>
                  )}
                </div>

                <div className={styles.metaInfo}>
                  <div className={styles.metaItem} title="Posted Date">
                    <Clock className={styles.icon} size={16} />
                    <span>
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className={styles.metaItem} title="Response Count">
                    <MessageSquare className={styles.icon} size={16} />
                    <span>{conversations[request.id] || 0} responses</span>
                  </div>
                  {request.owner_username && (
                    <div className={styles.metaItem} title="Request Owner">
                      <Users className={styles.icon} size={16} />
                      <span>{request.owner_username}</span>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {!isAuthenticated ? (
                    <button
                      className={styles.buttonSecondary}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request);
                        setShowAuthDialog(true);
                      }}
                    >
                      Sign In to View Details
                    </button>
                  ) : user?.userType === 'developer' ? (
                    <button
                      className={styles.buttonPrimary}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartConversation(request);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Please wait...' : 'Respond to Request'}
                    </button>
                  ) : (
                    <button className={styles.buttonOutline}>
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => {
            setShowAuthDialog(false);
            setSelectedRequest(null);
          }}
          onLogin={() =>
            navigate('/login', {
              state: {
                from: location.pathname,
                requestId: selectedRequest?.id,
              },
            })
          }
          onRegister={() =>
            navigate('/register', {
              state: {
                from: location.pathname,
                requestId: selectedRequest?.id,
              },
            })
          }
        />
        <SubscriptionDialog
          isOpen={showSubscriptionDialog}
          onClose={() => {
            setShowSubscriptionDialog(false);
            setSelectedRequest(null); // Clear selected request on close
          }}
          onSuccess={async () => {
            setShowSubscriptionDialog(false);
            // Re-check subscription status after successful subscription
            try {
              const subscriptionCheck = await api.get(
                '/payments/subscription-status'
              );
              if (
                subscriptionCheck.data?.status === 'active' &&
                selectedRequest
              ) {
                await handleStartConversation(selectedRequest);
              }
            } catch (err) {
              console.error(
                'Failed to verify subscription after payment:',
                err
              );
              setError('Failed to verify subscription. Please try again.');
            }
          }}
        />
      </main>
    </div>
  );
};
export default PublicRequests;
