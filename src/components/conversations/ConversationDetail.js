import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Send,
  ArrowLeft,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  FileText,
} from "lucide-react";
import Header from "../shared/Header";
import styles from "./ConversationDetail.module.css";

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const [proposalStatus, setProposalStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

  const isClient = user.userType === "client";
  const isDeveloper = user.userType === "developer";

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchConversation = async () => {
    try {
      const [conversationRes, requestRes] = await Promise.all([
        axios.get(`${apiUrl}/conversations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${apiUrl}/requests/${conversation?.request_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setConversation(conversationRes.data);
      setRequestDetails(requestRes.data);
      scrollToBottom();
    } catch (err) {
      console.error("Error fetching conversation:", err);
      setError("Failed to load conversation");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(
        `${apiUrl}/conversations/${id}/messages`,
        { content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewMessage("");
      await fetchConversation();
    } catch (err) {
      setError("Failed to send message");
    }
  };

  const handleProposal = async (accepted) => {
    try {
      await axios.put(
        `${apiUrl}/conversations/${id}/proposal`,
        { status: accepted ? "accepted" : "rejected" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProposalStatus(accepted ? "accepted" : "rejected");
      await fetchConversation();
    } catch (err) {
      setError("Failed to update proposal status");
    }
  };

  const renderStatusBar = () => {
    if (!conversation) return null;

    return (
      <div className={styles.statusBar}>
        <div className={styles.statusInfo}>
          <span className={`${styles.status} ${styles[conversation.status]}`}>
            {conversation.status}
          </span>
          {isClient && conversation.status === "pending" && (
            <div className={styles.proposalActions}>
              <button
                className={styles.acceptButton}
                onClick={() => handleProposal(true)}
              >
                <CheckCircle size={16} /> Accept Proposal
              </button>
              <button
                className={styles.rejectButton}
                onClick={() => handleProposal(false)}
              >
                <XCircle size={16} /> Decline
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRequestDetails = () => {
    if (!requestDetails) return null;

    return (
      <div className={styles.requestDetails}>
        <h3>Request Details</h3>
        <div className={styles.requestInfo}>
          <div className={styles.infoItem}>
            <FileText size={16} />
            <span>{requestDetails.title}</span>
          </div>
          <div className={styles.infoItem}>
            <DollarSign size={16} />
            <span>Budget: ${requestDetails.estimated_budget}</span>
          </div>
          {requestDetails.timeline && (
            <div className={styles.infoItem}>
              <Clock size={16} />
              <span>Timeline: {requestDetails.timeline}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessage = (message) => {
    const isOwnMessage = message.user_id === user.id;
    return (
      <div
        key={message.id}
        className={`${styles.message} ${
          isOwnMessage ? styles.sent : styles.received
        }`}
      >
        <div className={styles.messageContent}>
          <div className={styles.messageHeader}>
            <span className={styles.username}>
              {isOwnMessage ? "You" : message.username}
            </span>
            <span className={styles.timestamp}>
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>
          {message.content}
        </div>
      </div>
    );
  };

  if (!conversation) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.conversationContainer}>
        <div className={styles.sidebar}>
          {renderRequestDetails()}
          <div className={styles.participantInfo}>
            <h3>Participants</h3>
            <div className={styles.participant}>
              <User size={16} />
              <span>
                {conversation.starter_username} (
                {conversation.starter_user_type})
              </span>
            </div>
            <div className={styles.participant}>
              <User size={16} />
              <span>
                {conversation.recipient_username} (
                {conversation.recipient_user_type})
              </span>
            </div>
          </div>
        </div>

        <div className={styles.messageArea}>
          <div className={styles.header}>
            <button
              className={styles.backButton}
              onClick={() => navigate("/conversations")}
            >
              <ArrowLeft size={20} />
            </button>
            <h2>{requestDetails?.title}</h2>
          </div>

          {renderStatusBar()}

          <div className={styles.messageContainer}>
            {conversation.messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>

          <form
            className={styles.inputContainer}
            onSubmit={sendMessage}
            style={{
              opacity:
                conversation.status === "completed" ||
                conversation.status === "rejected"
                  ? 0.5
                  : 1,
              pointerEvents:
                conversation.status === "completed" ||
                conversation.status === "rejected"
                  ? "none"
                  : "auto",
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={
                conversation.status === "completed"
                  ? "This conversation is completed"
                  : conversation.status === "rejected"
                  ? "This conversation is closed"
                  : "Type your message..."
              }
              className={styles.input}
              disabled={
                conversation.status === "completed" ||
                conversation.status === "rejected"
              }
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
