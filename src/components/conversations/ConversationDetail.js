import axios from 'axios';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Info,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../utils/api';
import styles from './ConversationDetail.module.css';

const ConversationDetail = () => {
  // 1. Hooks and constants first
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

  // 2. State declarations
  const [conversation, setConversation] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [agreement, setAgreement] = useState(null);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 4. Callback functions (functions that need useCallback)
  const fetchConversation = useCallback(async (signal) => {
    try {
      // Use the dedicated endpoint that returns a single conversation with all messages
      const conversationRes = await api.get(`/conversations/${id}`, { signal });

      // Get request details
      const requestRes = await api.get(`/requests/${conversationRes.data.request_id}`, { signal });

      if (!signal.aborted) {
        setConversation(conversationRes.data);
        setRequestDetails(requestRes.data);
        setIsLoading(false);
      }
    } catch (err) {
      if (!signal.aborted) {
        console.error('Error fetching conversation:', err);
        setIsLoading(false);
      }
    }
  }, [id]);

  // Add this outside your component function
  const makeLinksClickable = (text) => {
    if (!text) return '';

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    const matches = text.match(urlRegex) || [];

    return parts.reduce((result, part, i) => {
      result.push(part);

      if (matches[i]) {
        result.push(
          <a
            key={i}
            href={matches[i]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {matches[i]}
          </a>
        );
      }

      return result;
    }, []);
  };

  // First useEffect - Polling
  useEffect(() => {
    if (!id || !token) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchWithSignal = async () => {
      try {
        // Use the direct endpoint that includes all messages
        const conversationRes = await api.get(`/conversations/${id}`, { signal });

        const requestRes = await api.get(`/requests/${conversationRes.data.request_id}`, { signal });

        if (!signal.aborted) {
          setConversation(conversationRes.data);
          setRequestDetails(requestRes.data);
          setIsLoading(false);
        }
      } catch (err) {
        if (!signal.aborted) {
          console.error('Error fetching conversation:', err);
          setIsLoading(false);
        }
      }
    };

    fetchWithSignal();
    const intervalId = setInterval(fetchWithSignal, 5000);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, [id, token]);

  // Second useEffect - State cleanup
  useEffect(() => {
    return () => {
      setConversation(null);
      setRequestDetails(null);
      setNewMessage('');
      setIsLoading(true);
      setAgreement(null);
      setShowAgreementModal(false);
      setIsSidebarVisible(false);
    };
  }, []);

  // Third useEffect - Event listener cleanup
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        setIsSidebarVisible(false);
        setShowAgreementModal(false);
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    if (requestDetails) {
      console.log("Request Details:", JSON.stringify(requestDetails, null, 2));
    }
  }, [requestDetails]);

  const sendSystemMessage = async (content) => {
    try {
      await axios.post(
        `${apiUrl}/conversations/${id}/messages`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchConversation();
    } catch (err) {
      console.error('Failed to send system message:', err);
    }
  };

  const handleProposal = async (accept) => {
    try {
      await axios.put(
        `${apiUrl}/conversations/${id}`,
        {
          status: accept ? 'active' : 'declined',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setConversation((prev) => ({
        ...prev,
        status: accept ? 'active' : 'declined',
      }));

      await sendSystemMessage(
        `${user.username} has ${accept ? 'accepted' : 'declined'
        } the conversation.`
      );

      toast.success(
        `Conversation ${accept ? 'accepted' : 'declined'} successfully`
      );
    } catch (err) {
      console.error('Error updating conversation:', err);
      toast.error(`Failed to ${accept ? 'accept' : 'decline'} conversation`);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const controller = new AbortController();

    try {
      console.log("Sending message:", newMessage.trim());
      const response = await axios.post(
        `${apiUrl}/conversations/${id}/messages`,
        { content: newMessage.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        }
      );
      console.log("Message sent successfully:", response.data);
      setNewMessage('');
      await fetchConversation(controller.signal);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to send message:', err.response?.data || err);
        toast.error(`Failed to send message: ${err.response?.data?.detail || err.message}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading conversation...</div>
        <ToastContainer />
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Conversation not found</div>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ToastContainer />

      {/* Add overlay div */}
      {isSidebarVisible && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarVisible(false)}
        />
      )}

      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          <span className={styles.backText}>Back</span>
        </button>
        <button
          className={styles.menuToggle}
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          aria-label={isSidebarVisible ? 'Close details' : 'Show details'}
        >
          <Info size={24} />
        </button>
      </div>
      <div className={styles.content}>
        {/* Main Messages Section */}

        <div className={styles.mainSection}>
          <div className={styles.messagesContainer}>
            {!conversation.messages?.length ? (
              <div className={styles.emptyMessages}>
                No messages yet. Start a conversation!
              </div>
            ) : (
              <>
                {conversation.messages.map((message, index) => {
                  const isSentByUser = message.user_id === user.id;
                  const isFreelanceSupport = message.message_metadata && message.message_metadata.source === 'freelance';
                  const currentDate = new Date(message.created_at);

                  const isSameDay = (date1, date2) => {
                    return date1?.toDateString() === date2?.toDateString();
                  };

                  const showDateDivider =
                    index === 0 ||
                    !isSameDay(
                      new Date(conversation.messages[index - 1]?.created_at),
                      currentDate
                    );

                  const getDateDividerWithTime = (date) => {
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    const timeString = date.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    });

                    if (date.toDateString() === today.toDateString()) {
                      return `Today ${timeString}`;
                    } else if (date.toDateString() === yesterday.toDateString()) {
                      return `Yesterday ${timeString}`;
                    } else {
                      return (
                        date.toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                        }) + ` ${timeString}`
                      );
                    }
                  };

                  return (
                    <div key={message.id}>
                      {showDateDivider && (
                        <div className={styles.timestampDivider}>
                          {getDateDividerWithTime(currentDate)}
                        </div>
                      )}
                      <div className={`${styles.messageWrapper} ${isSentByUser ? styles.sent : isFreelanceSupport ? styles.fromFreelanceWtf : styles.received}`}>
                        {isFreelanceSupport && <div className={styles.freelanceWtfIndicator}>Freelance.wtf Support</div>}
                        <div className={styles.messageContent}>
                          <div className={styles.messageText}>
                            {makeLinksClickable(message.content)}

                            {message.linked_content?.length > 0 && (
                              <div className={styles.linkedContent}>
                                {message.linked_content.map((link) => (
                                  <div key={link.id} className={styles.linkItem}>
                                    {link.type === 'video' ? (
                                      <button
                                        className={styles.videoLink}
                                        onClick={() => navigate(`/video_display/stream/${link.content_id}`)}
                                      >
                                        📹 View Attached Video: {link.title}
                                      </button>
                                    ) : link.type === 'profile' ? (
                                      <button
                                        className={styles.profileLink}
                                        onClick={() => navigate(`/profile/developers/${link.content_id}/public`)}
                                      >
                                        👤 View Developer Profile
                                      </button>
                                    ) : null}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Input Container */}
          <div className={styles.inputContainer}>
            <form onSubmit={sendMessage} className={styles.inputForm}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className={styles.messageInput}
              />
              <button type="submit" className={styles.sendButton}>
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div
          className={`${styles.sidebar} ${isSidebarVisible ? styles.mobileVisible : ''}`}
        >
          <div className={styles.sidebarHeader}>
            <button
              className={styles.closeSidebarButton}
              onClick={() => setIsSidebarVisible(false)}
            >
              Close Details
            </button>
          </div>

          {/* Request Details Section */}
          <div className={styles.sidebarSection}>
            <h2 className={styles.sidebarTitle}>Request Details</h2>
            <div className={styles.requestDetails}>
              <div className={styles.infoItem}>
                <FileText size={16} />
                <span>{requestDetails?.title}</span>
              </div>
              <div className={styles.infoItem}>
                <DollarSign size={16} />
                <span>
                  Budget: {formatCurrency(requestDetails?.estimated_budget)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <Clock size={16} />
                <span>
                  Posted:{' '}
                  {new Date(requestDetails?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Participants Section */}
          <div className={styles.sidebarSection}>
            <h2 className={styles.sidebarTitle}>Participants</h2>
            {[
              {
                id: conversation.starter_user_id,
                name: conversation.starter_username,
              },
              {
                id: conversation.recipient_user_id,
                name: conversation.recipient_username,
              },
            ].map((participant) => (
              <div
                key={participant.id}
                className={`${styles.participant} ${participant.id === user.id ? styles.currentUser : ''
                  }`}
              >
                <User size={16} />
                <span>{participant.name}</span>
                {participant.id === user.id && (
                  <span className={styles.youLabel}>(You)</span>
                )}
              </div>
            ))}
          </div>

          {/* Actions Section */}
          {user.userType === 'client' && conversation.status === 'pending' && (
            <div className={styles.sidebarSection}>
              <h2 className={styles.sidebarTitle}>Actions</h2>
              <div className={styles.actions}>
                <button
                  onClick={() => handleProposal(true)}
                  className={styles.acceptButton}
                >
                  <CheckCircle size={16} />
                  Accept
                </button>
                <button
                  onClick={() => handleProposal(false)}
                  className={styles.rejectButton}
                >
                  <XCircle size={16} />
                  Decline
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Agreement Modal */}
      {showAgreementModal && agreement && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowAgreementModal(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>Work Agreement Details</h2>
              <button
                className={styles.closeButton}
                onClick={() => setShowAgreementModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.agreementFullDetails}>
                <p>
                  <strong>Price:</strong> {formatCurrency(agreement.price)}
                </p>
                <p>
                  <strong>Status:</strong> {agreement.status}
                </p>
                <p>
                  <strong>Terms:</strong>
                </p>
                <div className={styles.termsContent}>{agreement.terms}</div>
                <p>
                  <strong>Created:</strong>{' '}
                  {new Date(agreement.created_at).toLocaleDateString()}
                </p>
                {agreement.accepted_at && (
                  <p>
                    <strong>Accepted:</strong>{' '}
                    {new Date(agreement.accepted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ConversationDetail;