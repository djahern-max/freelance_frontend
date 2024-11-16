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
import styles from "./ConversationDetail.module.css";

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Declare hooks inside the component
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Sidebar toggle state
  const [conversation, setConversation] = useState(null);
  const [requestDetails, setRequestDetails] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (id && token) {
      fetchConversation();
      const interval = setInterval(fetchConversation, 5000);
      return () => clearInterval(interval);
    }
  }, [id, token]);

  const fetchConversation = async () => {
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
          headers: { Authorization: `Bearer ${token}` },
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchConversation();
    } catch (err) {
      setError("Failed to update proposal status");
    }
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
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>{requestDetails?.title}</h1>
          {window.innerWidth <= 768 && (
            <button
              className={styles.sidebarToggle}
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              ☰
            </button>
          )}
        </div>

        <div className={styles.messagesContainer}>
          {conversation.messages.map((message) => (
            <div
              key={message.id}
              className={`${styles.messageWrapper} ${
                message.user_id === user.id ? styles.sent : styles.received
              }`}
            >
              <div className={styles.message}>
                <div className={styles.messageHeader}>
                  <span className={styles.username}>
                    {message.user_id === user.id ? "You" : message.username}
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
              disabled={
                conversation.status === "completed" ||
                conversation.status === "rejected"
              }
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={
                !newMessage.trim() ||
                conversation.status === "completed" ||
                conversation.status === "rejected"
              }
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      <div className={`${styles.sidebar} ${isSidebarOpen ? "open" : ""}`}>
        <div className={styles.sidebarSection}>
          <h2 className={styles.sidebarTitle}>Request Details</h2>
          <div className={styles.requestDetails}>
            <div className={styles.infoItem}>
              <FileText size={16} />
              <span>{requestDetails?.title}</span>
            </div>
            <div className={styles.infoItem}>
              <DollarSign size={16} />
              <span>Budget: ${requestDetails?.estimated_budget}</span>
            </div>
            <div className={styles.infoItem}>
              <Clock size={16} />
              <span>
                Posted:{" "}
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
          <div className={styles.participant}>
            <User size={16} />
            <span>{conversation.starter_username}</span>
          </div>
          <div className={styles.participant}>
            <User size={16} />
            <span>{conversation.recipient_username}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationDetail;
