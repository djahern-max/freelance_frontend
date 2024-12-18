import { Clock, Loader, MessageSquare, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import SubscriptionDialog from '../payments/SubscriptionDialog';

import { useCallback, useRef } from 'react';
import { useSnagTicket } from '../../utils/snagTicket';
import Header from '../shared/Header';
import EmptyState from './EmptyState';
import styles from './PublicRequests.module.css';

const POLL_INTERVAL = 60000; // Increased to 60 seconds
const DEBOUNCE_DELAY = 300; // 300ms debounce for rapid updates

const PublicRequests = () => {
  const [publicRequests, setPublicRequests] = useState([]);
  const [conversations, setConversations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  const pollTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastFetchTimeRef = useRef(Date.now());

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const { snagTicket } = useSnagTicket(navigate);

  const createConversation = async (requestId) => {
    try {
      const response = await api.conversations.create({
        request_id: requestId,
      });
      return response;
    } catch (error) {
      if (error.response?.status === 403) {
        throw new Error('subscription_required');
      }
      throw error;
    }
  };

  const fetchData = useCallback(
    async (isPolling = false) => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      // Don't show loading indicator for polling updates
      if (!isPolling) {
        setLoading(true);
      } else {
        setPolling(true);
      }

      try {
        setError(null);
        const currentTime = Date.now();

        // Prevent too frequent updates
        if (
          isPolling &&
          currentTime - lastFetchTimeRef.current < DEBOUNCE_DELAY
        ) {
          return;
        }

        lastFetchTimeRef.current = currentTime;

        const publicResponse = await api.get('/requests/public', {
          signal: abortControllerRef.current.signal,
        });

        // Only update if the component is still mounted
        setPublicRequests((prevRequests) => {
          // Avoid unnecessary re-renders
          if (
            JSON.stringify(prevRequests) === JSON.stringify(publicResponse.data)
          ) {
            return prevRequests;
          }
          return publicResponse.data;
        });

        if (isAuthenticated && user) {
          const conversationsResponse = await api.get(
            '/conversations/user/list',
            {
              signal: abortControllerRef.current.signal,
            }
          );

          const conversationCounts = conversationsResponse.data.reduce(
            (acc, conv) => {
              acc[conv.request_id] = (acc[conv.request_id] || 0) + 1;
              return acc;
            },
            {}
          );

          setConversations((prevCounts) => {
            // Avoid unnecessary re-renders
            if (
              JSON.stringify(prevCounts) === JSON.stringify(conversationCounts)
            ) {
              return prevCounts;
            }
            return conversationCounts;
          });
        }
      } catch (err) {
        // Handle cancelled requests and aborts silently
        if (err.message === 'REQUEST_CANCELLED' || err.name === 'AbortError') {
          return;
        }

        // Only set error for non-polling requests
        if (!isPolling) {
          const errorMessage =
            err.code === 'ERR_NETWORK'
              ? 'Unable to connect to server. Please check your connection and try again.'
              : err.response?.data?.detail || 'Failed to fetch requests.';

          setError(errorMessage);
          // Only log real errors
          console.error('Error fetching data:', err);
        }
      } finally {
        if (!isPolling) {
          setLoading(false);
        }
        setPolling(false);
      }
    },
    [isAuthenticated, user]
  );

  useEffect(() => {
    fetchData();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  useEffect(() => {
    const setupPolling = () => {
      if (isAuthenticated) {
        pollTimeoutRef.current = setTimeout(() => {
          fetchData(true).then(() => {
            setupPolling();
          });
        }, POLL_INTERVAL);
      }
    };

    setupPolling();

    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [isAuthenticated, fetchData]);

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
      const subscriptionResponse = await api.subscriptions.getStatus();

      if (!subscriptionResponse || subscriptionResponse.status !== 'active') {
        setShowSubscriptionDialog(true);
        return;
      }

      // Create conversation if subscription is active
      const conversationData = await createConversation(request.id);
      navigate(`/conversations/${conversationData.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);

      if (err.message === 'subscription_required') {
        setShowSubscriptionDialog(true);
        return;
      }

      setError(api.helpers.handleError(err));
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
        {polling && (
          <div className={styles.pollingIndicator}>
            <Loader className={styles.spinnerSmall} />
            <span>Scanning for New Requests...</span>
          </div>
        )}
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
                <span
                  className={styles.snagEmoji}
                  role="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    snagTicket(request.id);
                  }}
                  title="Snag this request"
                >
                  🌀 <span className={styles.snagText}>Snag Ticket</span>
                </span>
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
                <div className={styles.cardFooter}>
                  <div className={styles.statusBadgeWrapper}></div>
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
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.metaInfo}>{/* ... */}</div>
                </div>
                <div className={styles.cardActionsWrapper}>
                  <div
                    className={`${styles.statusBadge} ${
                      styles[request.status?.toLowerCase() || 'open']
                    }`}
                    title="Request Status"
                  >
                    {request.status?.replace('_', ' ').toUpperCase() || 'OPEN'}
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
                      <>
                        <button
                          className={styles.buttonPrimary}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartConversation(request);
                          }}
                          disabled={loading}
                        >
                          {loading ? 'Please wait...' : 'Start Conversation'}
                        </button>
                      </>
                    ) : (
                      <button className={styles.buttonOutline}>
                        View Details
                      </button>
                    )}
                  </div>
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
            setSelectedRequest(null);
          }}
          onSuccess={async () => {
            setShowSubscriptionDialog(false);
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
