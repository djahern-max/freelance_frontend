import { Loader } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { useSnagTicket } from '../../utils/snagTicket';
import AuthDialog from '../auth/AuthDialog';
import SubscriptionDialog from '../payments/SubscriptionDialog';
import Header from '../shared/Header';
import EmptyState from './EmptyState';
import PublicRequestCard from './PublicRequestCard';
import styles from './PublicRequests.module.css';
import SnagTicketModal from './SnagTicketModal';

const POLL_INTERVAL = 60000;
const DEBOUNCE_DELAY = 300;

const PublicRequests = () => {
  // Existing state
  const [publicRequests, setPublicRequests] = useState([]);
  const [conversations, setConversations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  // New state for snag ticket functionality
  const [showSnagModal, setShowSnagModal] = useState(false);
  const [userVideos, setUserVideos] = useState([]);
  const [profileUrl, setProfileUrl] = useState(null);

  const pollTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);
  const lastFetchTimeRef = useRef(Date.now());

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const {
    snagTicket,
    loading: snagLoading,
    error: snagError,
    setError: setSnagError,
  } = useSnagTicket();

  // Add function to fetch user's videos
  const fetchUserVideos = async () => {
    try {
      const response = await api.get('/video_display/my-videos');
      // Make sure we're setting the correct data structure with id and title
      const formattedVideos = (response.data.user_videos || []).map(
        (video) => ({
          id: video.id,
          title: video.title,
        })
      );
      setUserVideos(formattedVideos);
    } catch (error) {
      console.error('Failed to fetch user videos:', error);
      setUserVideos([]);
    }
  };

  // Add function to fetch developer profile URL
  const fetchProfileUrl = async () => {
    try {
      const response = await api.get('/profile/developer');
      // Assuming the profile URL is in the response
      const profileUrlFromResponse =
        response.data.profile_url ||
        `/profile/developers/${response.data.user_id}/public`;
      setProfileUrl(profileUrlFromResponse);
    } catch (error) {
      console.error('Failed to fetch profile URL:', error);
      setProfileUrl(null);
    }
  };

  // Modify snag ticket handler
  const handleSnagTicket = async (requestId) => {
    if (!isAuthenticated) {
      setSelectedRequest({ id: requestId });
      setShowAuthDialog(true);
      return;
    }

    // Add check for client user type
    if (user?.userType === 'client') {
      toast("You're a Client, You Sure You Have the Chops for This? 💪", {
        type: 'warning',
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return; // Prevent further execution for clients
    }

    try {
      await Promise.all([fetchUserVideos(), fetchProfileUrl()]);

      setSelectedRequest(publicRequests.find((r) => r.id === requestId));
      setShowSnagModal(true);
    } catch (error) {
      console.error('Error preparing snag ticket:', error);
      toast('Failed to prepare snag ticket. Please try again.', {
        type: 'error',
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  };

  // Add function to handle snag ticket submission
  const handleSnagSubmit = async (formData) => {
    try {


      const result = await snagTicket(selectedRequest.id, formData);


      setShowSnagModal(false);
      toast.success('Request sent successfully!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true
      });

      // Refresh the data
      await fetchData();
    } catch (error) {
      console.error('Snag request failed:', error);

      const errorMessage = error.response?.data?.detail || 'Failed to snag request. Please try again.';
      toast.error(errorMessage, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true
      });

      if (error.response?.status === 400) {
        setShowSnagModal(false);
      }
    }
  };

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
    let mounted = true;

    const setupPolling = () => {
      if (!mounted || !isAuthenticated) return;

      pollTimeoutRef.current = setTimeout(async () => {
        try {
          if (mounted && isAuthenticated) {
            await fetchData(true);
            setupPolling(); // Setup next poll only after successful fetch
          }
        } catch (error) {
          console.error('Polling error:', error);
          if (mounted && isAuthenticated) {
            setupPolling(); // Retry polling even after error
          }
        }
      }, POLL_INTERVAL);
    };

    if (isAuthenticated) {
      setupPolling();
    }

    return () => {
      mounted = false;
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
        <SnagTicketModal
          isOpen={showSnagModal}
          onClose={() => {
            setShowSnagModal(false);
            setSelectedRequest(null);
            setSnagError(null);
          }}
          onSubmit={handleSnagSubmit}
          videos={userVideos}
          profileUrl={profileUrl}
          isLoading={snagLoading}
          error={snagError}
        />
        {/* Add temporary debugging output */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ display: 'none' }}>
            Debug: Videos Count: {userVideos?.length || 0}
            Debug: Has Profile URL: {profileUrl ? 'Yes' : 'No'}
          </div>
        )}

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
              <PublicRequestCard
                key={request.id}
                request={request}
                onSnag={handleSnagTicket}
                onCardClick={handleRequestClick}
                isExpanded={expandedCards[request.id]}
                onToggleExpand={toggleCardExpansion}
                isAuthenticated={isAuthenticated}
                userType={user?.userType}
                loading={loading}
                conversations={conversations}
                onStartConversation={handleStartConversation}
                onAuthDialog={(e) => {
                  e.stopPropagation();
                  setSelectedRequest(request);
                  setShowAuthDialog(true);
                }}
              />
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
