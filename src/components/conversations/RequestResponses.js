import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { MessageSquare, Clock, ChevronRight, ArrowLeft } from "lucide-react";
import Header from "../shared/Header";
import styles from "./RequestResponses.module.css";

const RequestResponses = () => {
  const [conversations, setConversations] = useState([]);
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const requestId = queryParams.get("request");

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchData();
  }, [requestId]);

  const fetchData = async () => {
    try {
      // Fetch request details
      const requestResponse = await axios.get(
        `${apiUrl}/requests/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRequestDetails(requestResponse.data);

      // Fetch conversations for this request
      const conversationsResponse = await axios.get(
        `${apiUrl}/conversations/user/list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Filter conversations for this specific request
      const relevantConversations = conversationsResponse.data.filter(
        (conv) => conv.request_id === parseInt(requestId)
      );

      setConversations(relevantConversations);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load responses");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading responses...</div>
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>Request not found</div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => navigate("/requests/public")}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className={styles.title}>Responses to Your Request</h1>
        </div>

        <div className={styles.requestCard}>
          <h2 className={styles.requestTitle}>{requestDetails.title}</h2>
          <p className={styles.requestContent}>{requestDetails.content}</p>
          <div className={styles.requestMeta}>
            <Clock className={styles.icon} />
            <span>Posted {formatDate(requestDetails.created_at)}</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.responseCount}>
          <MessageSquare className={styles.icon} />
          <span>{conversations.length} Responses</span>
        </div>

        <div className={styles.conversationList}>
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={styles.conversationCard}
                onClick={() => navigate(`/conversations/${conversation.id}`)}
              >
                <div className={styles.cardContent}>
                  <div className={styles.responderInfo}>
                    <strong>
                      {conversation.starter_user_id === parseInt(user.id)
                        ? conversation.recipient_username
                        : conversation.starter_username}
                    </strong>
                    {conversation.messages?.[0] && (
                      <span className={styles.timestamp}>
                        {formatDate(conversation.messages[0].created_at)}
                      </span>
                    )}
                  </div>

                  {conversation.messages?.[0] && (
                    <p className={styles.messagePreview}>
                      {conversation.messages[0].content}
                    </p>
                  )}
                </div>
                <ChevronRight className={styles.chevronIcon} />
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <MessageSquare className={styles.emptyIcon} />
              <p>No responses yet</p>
              <p className={styles.emptySubtext}>
                Responses will appear here when someone starts a conversation
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestResponses;
