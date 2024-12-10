import axios from 'axios';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Menu,
  Send,
  User,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../utils/api';
import styles from './ConversationDetail.module.css';

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

  // State declarations
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
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const lastSeenAgreementRef = useRef(null);

  // Fetch conversation data
  const fetchConversation = useCallback(async () => {
    try {
      const conversationRes = await api.get(`/conversations/${id}`);
      const requestRes = await api.get(
        `/requests/${conversationRes.data.request_id}`
      );

      setConversation(conversationRes.data);
      setRequestDetails(requestRes.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      toast.error('Failed to load conversation.');
      setIsLoading(false);
    }
  }, [id]);

  // Add this after fetchConversation
  const fetchAgreement = useCallback(async () => {
    if (!conversation?.request_id) return;

    try {
      console.log('Fetching agreement for request:', conversation.request_id); // Debug log
      const response = await api.get(
        `/agreements/request/${conversation.request_id}`
      );
      console.log('Fetched agreement:', response.data); // Debug log
      setAgreement(response.data);

      // If we find an agreement and conversation isn't in negotiating state, update it
      if (response.data && conversation.status !== 'negotiating') {
        await api.patch(`/conversations/${id}`, {
          status: 'negotiating',
        });
        fetchConversation(); // Refresh conversation data
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Error fetching agreement:', err);
      }
      setAgreement(null);
    }
  }, [conversation?.request_id, id, conversation?.status, fetchConversation]);

  // Polling effects for agreement
  // Single polling effect for agreement updates
  useEffect(() => {
    if (!conversation?.request_id || !token) return;

    // Initial fetch
    fetchAgreement();

    // Set up polling only when needed
    const shouldPoll = ['negotiating', 'agreed'].includes(conversation.status);
    const intervalId = shouldPoll
      ? setInterval(() => {
          // Use a function to ensure we're working with fresh state
          fetchAgreement().catch((err) => {
            console.error('Polling error:', err);
            // Optionally show user-friendly error
            toast.error('Error updating agreement status');
          });
        }, 5000)
      : null;

    // Cleanup
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [conversation?.request_id, conversation?.status, token, fetchAgreement]);

  // Polling effects
  useEffect(() => {
    if (!id || !token) return;
    fetchConversation();
    const intervalId = setInterval(fetchConversation, 5000);
    return () => clearInterval(intervalId);
  }, [id, token, fetchConversation]);

  useEffect(() => {
    if (
      agreement &&
      user.id !== agreement.proposed_by &&
      lastSeenAgreementRef.current !== agreement.id &&
      agreement.status === 'proposed'
    ) {
      toast.info('A new agreement has been proposed!', {
        autoClose: false,
        onClick: () => setShowAgreementModal(true),
      });
      lastSeenAgreementRef.current = agreement.id;
    }
  }, [agreement, user.id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  const handleAgreementClick = (e) => {
    if (e.target.tagName.toLowerCase() === 'button') {
      return;
    }

    if (agreement) {
      setShowAgreementModal(true);
    } else if (user.userType === 'developer' || user.userType === 'client') {
      setShowAgreementForm(true);
    }
  };

  const createAgreement = async (e) => {
    e.preventDefault();
    setIsSubmittingAgreement(true);
    try {
      // Update conversation status using api instance
      await api.patch(`/conversations/${id}`, {
        status: 'negotiating',
      });

      // Create agreement using api.agreements helper
      const response = await api.agreements.create({
        request_id: conversation.request_id,
        price: Number(price),
        terms,
        developer_id:
          user.userType === 'developer'
            ? user.id
            : conversation.starter_user_id,
        client_id:
          user.userType === 'client' ? user.id : conversation.recipient_user_id,
        status: 'proposed',
        proposed_by: user.id,
      });

      // Maintain all your existing state updates
      setAgreement(response.data);
      setShowAgreement(false);
      setShowAgreementForm(false);
      toast.success('Agreement proposed successfully!');
      await fetchConversation();
    } catch (err) {
      console.error('Failed to create agreement:', err);
      toast.error(err.response?.data?.detail || 'Failed to create agreement.');
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
      await fetchAgreement();
      toast.success('Agreement accepted!');
      await sendSystemMessage(
        `${user.username} has accepted the work agreement.`
      );
    } catch (err) {
      console.error('Failed to accept agreement:', err);
      toast.error('Failed to accept agreement.');
    } finally {
      setIsAcceptingAgreement(false);
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
        `${user.username} has ${
          accept ? 'accepted' : 'declined'
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

    try {
      await axios.post(
        `${apiUrl}/conversations/${id}/messages`,
        { content: newMessage.trim() },
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

  return (
    <div className={styles.container}>
      <ToastContainer />

      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.title}>{requestDetails?.title}</h1>
        <button
          className={styles.menuToggle}
          onClick={() => setIsSidebarVisible(!isSidebarVisible)}
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
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
                {conversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.messageWrapper} ${
                      message.user_id === user.id
                        ? styles.sent
                        : styles.received
                    }`}
                  >
                    <div className={styles.message}>
                      <div className={styles.messageHeader}>
                        <span className={styles.username}>
                          {message.user_id === user.id
                            ? 'You'
                            : message.username}
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
              </>
            )}
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

        {/* Sidebar */}
        <div
          className={`${styles.sidebar} ${
            isSidebarVisible ? styles.mobileVisible : ''
          }`}
        >
          {/* Agreement Section */}
          <div className={styles.sidebarSection}>
            <div className={styles.sectionHeader}>
              {(user.userType === 'developer' || user.userType === 'client') &&
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
              showAgreementForm && (
                <div className={styles.agreementContent}>
                  <form
                    onSubmit={createAgreement}
                    className={styles.agreementForm}
                  >
                    <h3>Propose Work Agreement</h3>
                    <div className={styles.formGroup}>
                      <label>Price (USD)</label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Check if input is a valid number
                          if (!/^\d*$/.test(value)) {
                            toast.error('Please enter numbers only');
                            return;
                          }
                          setPrice(value);
                        }}
                        required
                        className={styles.input}
                        placeholder="Enter price in USD"
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
                        {isSubmittingAgreement
                          ? 'Creating...'
                          : 'Propose Agreement'}
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
                </div>
              )
            )}
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
