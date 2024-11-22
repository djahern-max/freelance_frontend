import axios from 'axios';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './ConversationDetail.module.css';

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [conversation, setConversation] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAgreement, setShowAgreement] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [isSubmittingAgreement, setIsSubmittingAgreement] = useState(false);
  const [isAcceptingAgreement, setIsAcceptingAgreement] = useState(false);
  const [showAgreementForm, setShowAgreementForm] = useState(false);
  const [price, setPrice] = useState('');
  const [terms, setTerms] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;
  const fetchConversation = useCallback(async () => {
    try {
      const conversationRes = await axios.get(`${apiUrl}/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const requestRes = await axios.get(
        `${apiUrl}/requests/${conversationRes.data.request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setConversation(conversationRes.data);
      setRequestDetails(requestRes.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      toast.error('Failed to load conversation.');
      setIsLoading(false);
    }
  }, [id, token, apiUrl]);

  const fetchAgreement = useCallback(async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/agreements/request/${conversation?.request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAgreement(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setAgreement(null);
        return;
      }

      console.error('Error fetching agreement:', err);
      if (err.response?.status !== 404) {
        toast.error('Failed to load agreement details.');
      }
    }
  }, [conversation?.request_id, token, apiUrl]);

  // 1. Conversation data fetching
  useEffect(() => {
    let intervalId;

    if (id && token) {
      // Initial fetch
      fetchConversation();

      // Set up polling
      intervalId = setInterval(fetchConversation, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id, token, fetchConversation]); // Added fetchConversation to dependencies

  // 2. Messages effect - we can probably remove this if it's not doing anything
  // If you need to do something when messages change, add it here
  useEffect(() => {
    if (conversation?.messages) {
    }
  }, [conversation?.messages]);

  // 3. Agreement polling
  useEffect(() => {
    let intervalId;

    if (conversation?.request_id && token && !agreement) {
      // Initial fetch
      fetchAgreement();

      // Set up polling only if no agreement exists
      intervalId = setInterval(fetchAgreement, 5000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [conversation?.request_id, token, agreement, fetchAgreement]); // More specific dependency

  const sendMessage = async (e, systemMessage = null) => {
    e.preventDefault();
    const messageContent = systemMessage || newMessage.trim();
    if (!messageContent) return;

    try {
      await axios.post(
        `${apiUrl}/conversations/${id}/messages`,
        { content: messageContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage('');
      await fetchConversation();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error('Failed to send message.');
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleProfileClick = (userId, userType) => {
    // Prevent click on current user
    if (userId === user.id) return;

    // Navigate to the appropriate profile page based on user type
    try {
      navigate(`/profile/${userId}`);
    } catch (err) {
      console.error('Error navigating to profile:', err);
      toast.error('Unable to view profile at this time.');
    }
  };

  const handleAgreementClick = (e) => {
    // Don't trigger if clicking accept/reject buttons
    if (e.target.tagName.toLowerCase() === 'button') {
      return;
    }

    if (agreement) {
      // Changed from setShowAgreement to setShowAgreementModal
      setShowAgreementModal(true);
    } else if (user.userType === 'developer') {
      setShowAgreementForm(true);
    }
  };

  const createAgreement = async (e) => {
    e.preventDefault();
    setIsSubmittingAgreement(true);
    try {
      const response = await axios.post(
        `${apiUrl}/agreements/`,
        {
          request_id: conversation.request_id,
          price: Number(price),
          terms,
          developer_id:
            user.userType === 'developer'
              ? user.id
              : conversation.starter_user_id,
          client_id:
            user.userType === 'client'
              ? user.id
              : conversation.recipient_user_id,
          status: 'proposed',
          proposed_by: user.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAgreement(response.data);
      setShowAgreement(false);
      toast.success('Agreement proposed successfully!');
      // Send a system message about the agreement
      await sendMessage({
        preventDefault: () => {},
        systemMessage: `${user.username} has proposed a work agreement for $${price}.`,
      });
    } catch (err) {
      console.error('Failed to create agreement:', err);
      toast.error('Failed to create agreement.');
    } finally {
      setIsSubmittingAgreement(false);
    }
  };

  const acceptAgreement = async () => {
    setIsAcceptingAgreement(true);
    try {
      await axios.post(
        `${apiUrl}/agreements/${agreement.id}/accept`,
        {
          accepted_by: user.id,
          accepted_at: new Date().toISOString(),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAgreement();
      toast.success('Agreement accepted!');
      // Send a system message about the acceptance
      await sendMessage({
        preventDefault: () => {},
        systemMessage: `${user.username} has accepted the work agreement.`,
      });
    } catch (err) {
      console.error('Failed to accept agreement:', err);
      toast.error('Failed to accept agreement.');
    } finally {
      setIsAcceptingAgreement(false);
    }
  };

  const renderAgreementSection = () => (
    <div className={styles.agreementContent}>
      {agreement ? (
        <div className={styles.existingAgreement}>
          <h3>Work Agreement</h3>
          <div className={styles.agreementDetails}>
            <p>
              <strong>Price:</strong> ${agreement.price}
            </p>
            <p>
              <strong>Status:</strong> {agreement.status}
            </p>
            <p>
              <strong>Terms:</strong> {agreement.terms}
            </p>
            {agreement.status === 'proposed' &&
              user.id !== agreement.proposed_by && (
                <button
                  onClick={acceptAgreement}
                  className={styles.acceptButton}
                  disabled={isAcceptingAgreement}
                >
                  {isAcceptingAgreement ? 'Accepting...' : 'Accept Agreement'}
                </button>
              )}
          </div>
        </div>
      ) : (
        user.userType === 'developer' &&
        showAgreementForm && (
          <form onSubmit={createAgreement} className={styles.agreementForm}>
            <h3>Propose Work Agreement</h3>
            <div className={styles.formGroup}>
              <label>Price (USD)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Terms and Conditions</label>
              <textarea
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
                required
                className={styles.textarea}
                placeholder="Describe the work terms, timeline, and payment schedule..."
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmittingAgreement}
              >
                {isSubmittingAgreement ? 'Creating...' : 'Propose Agreement'}
              </button>
              <button
                type="button"
                onClick={() => setShowAgreementForm(false)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </form>
        )
      )}
    </div>
  );
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

  const handleProposal = async (accept) => {
    try {
      // Update the conversation status
      const response = await axios.put(
        `${apiUrl}/conversations/${id}`,
        {
          status: accept ? 'active' : 'declined',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Update local state
      setConversation((prev) => ({
        ...prev,
        status: accept ? 'active' : 'declined',
      }));

      // Send system message
      await sendMessage({
        preventDefault: () => {},
        systemMessage: `${user.username} has ${
          accept ? 'accepted' : 'declined'
        } the conversation.`,
      });

      // Show success message
      toast.success(
        `Conversation ${accept ? 'accepted' : 'declined'} successfully`
      );
    } catch (err) {
      console.error('Error updating conversation:', err);
      toast.error(`Failed to ${accept ? 'accept' : 'decline'} conversation`);
    }
  };

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.title}>{requestDetails?.title}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.mainSection}>
          <div className={styles.messagesContainer}>
            <div className={styles.emptyMessages}>
              No messages yet. Start the conversation!
            </div>
            {conversation.messages?.map((message) => (
              <div
                key={message.id}
                className={`${styles.messageWrapper} ${
                  message.user_id === user.id ? styles.sent : styles.received
                }`}
              >
                <div className={styles.message}>
                  <div className={styles.messageHeader}>
                    <span className={styles.username}>
                      {message.user_id === user.id ? 'You' : message.username}
                    </span>
                    <span className={styles.timestamp}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className={styles.messageContent}>{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

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

        <div className={styles.sidebar}>
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
              <div
                className={`${styles.statusIndicator} ${
                  styles[conversation.status]
                }`}
              >
                <span>
                  {conversation.status.charAt(0).toUpperCase() +
                    conversation.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

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
                className={`${styles.participant} ${
                  participant.id === user.id ? styles.currentUser : ''
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
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>
              {user.userType === 'developer' &&
                !agreement &&
                !showAgreementForm && (
                  <button
                    onClick={() => setShowAgreementForm(true)}
                    className={styles.createAgreementButton}
                  >
                    <FileText size={16} />
                    Create Agreement
                  </button>
                )}
            </div>
            {agreement ? (
              <div
                className={`${styles.existingAgreement} ${styles.clickable}`}
                onClick={handleAgreementClick}
                role="button"
                tabIndex={0}
              >
                <h3>Work Agreement</h3>
                <div className={styles.agreementDetails}>
                  <p>
                    <strong>Price:</strong> {formatCurrency(agreement.price)}
                  </p>
                  <p>
                    <strong>Status:</strong> {agreement.status}
                  </p>
                  <p className={styles.agreementPreview}>
                    <strong>Terms:</strong> {agreement.terms.substring(0, 100)}
                    {agreement.terms.length > 100 && '...'}
                  </p>
                  {agreement.status === 'proposed' &&
                    user.id !== agreement.proposed_by && (
                      <div className={styles.agreementActions}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            acceptAgreement();
                          }}
                          className={styles.acceptButton}
                          disabled={isAcceptingAgreement}
                        >
                          {isAcceptingAgreement
                            ? 'Accepting...'
                            : 'Accept Agreement'}
                        </button>
                      </div>
                    )}
                </div>
              </div>
            ) : (
              showAgreementForm && renderAgreementSection()
            )}
          </div>

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
                <div className={styles.modalActions}>
                  {agreement.status === 'accepted' ? (
                    <button
                      onClick={() => {
                        setShowAgreementModal(false);
                        setShowAgreementForm(true);
                        setPrice(agreement.price.toString());
                        setTerms(agreement.terms);
                      }}
                      className={styles.modifyButton}
                    >
                      Request Change Order
                    </button>
                  ) : agreement.status === 'proposed' &&
                    user.id !== agreement.proposed_by ? (
                    <>
                      <button
                        onClick={acceptAgreement}
                        className={styles.acceptButton}
                        disabled={isAcceptingAgreement}
                      >
                        {isAcceptingAgreement
                          ? 'Accepting...'
                          : 'Accept Agreement'}
                      </button>
                      <button
                        onClick={() => {
                          setShowAgreementModal(false);
                          setShowAgreementForm(true);
                          setPrice(agreement.price.toString());
                          setTerms(agreement.terms);
                        }}
                        className={styles.modifyButton}
                      >
                        Counter Proposal
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationDetail;
