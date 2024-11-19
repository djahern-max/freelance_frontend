import axios from 'axios';
import { ArrowLeft, FileText, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

  const [showAgreement, setShowAgreement] = useState(false);
  const [agreement, setAgreement] = useState(null);
  const [price, setPrice] = useState('');
  const [terms, setTerms] = useState('');
  const [isSubmittingAgreement, setIsSubmittingAgreement] = useState(false);
  const [isAcceptingAgreement, setIsAcceptingAgreement] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversation = async () => {
    try {
      const conversationRes = await axios.get(`${apiUrl}/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch request details separately
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
  };

  // Fetch conversation data on load
  useEffect(() => {
    if (id && token) {
      fetchConversation();
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  useEffect(() => {
    if (conversation?.request_id && token) {
      fetchAgreement();
    }
  }, [conversation, token]);

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

  const fetchAgreement = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/agreements/request/${conversation.request_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAgreement(response.data);
    } catch (err) {
      console.error('Error fetching agreement:', err);
      // If 404, there's no agreement yet - that's okay
      if (err.response?.status !== 404) {
        toast.error('Failed to load agreement details.');
      }
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
    <div className={styles.agreementSection}>
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
        user.userType === 'developer' && (
          <div className={styles.createAgreement}>
            {showAgreement ? (
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
                    {isSubmittingAgreement
                      ? 'Creating...'
                      : 'Propose Agreement'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAgreement(false)}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAgreement(true)}
                className={styles.createButton}
              >
                <FileText size={20} />
                Create Work Agreement
              </button>
            )}
          </div>
        )
      )}
    </div>
  );

  return (
    <div className={styles.container}>
      <ToastContainer />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>{requestDetails?.title}</h1>
        </div>

        {renderAgreementSection()}

        <div className={styles.messagesContainer}>
          {conversation.messages &&
            conversation.messages.map((message) => (
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
              className={styles.input}
            />
            <button type="submit" className={styles.sendButton}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
