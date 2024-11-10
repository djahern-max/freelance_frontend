import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { MessageSquare, Clock, ChevronRight } from "lucide-react";
import Header from "../shared/Header";
import styles from "./ConversationsList.module.css";

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchConversations();
    // Poll for new conversations every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${apiUrl}/conversations/user/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get the request details for each conversation
      const conversationsWithDetails = await Promise.all(
        response.data.map(async (conversation) => {
          try {
            const requestResponse = await axios.get(
              `${apiUrl}/requests/${conversation.request_id}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            return {
              ...conversation,
              requestDetails: requestResponse.data,
            };
          } catch (err) {
            console.error(
              `Error fetching request ${conversation.request_id}:`,
              err
            );
            return {
              ...conversation,
              requestDetails: { title: "Unknown Request" },
            };
          }
        })
      );

      setConversations(conversationsWithDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getOtherUserName = (conversation) => {
    return currentUser.id === conversation.starter_user_id
      ? conversation.recipient_username
      : conversation.starter_username;
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Conversations</h1>
          <div className={styles.stats}>
            <MessageSquare className={styles.icon} />
            <span className={styles.count}>{conversations.length} Active</span>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.list}>
          {conversations.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare className={styles.emptyIcon} />
              <p className={styles.emptyText}>No conversations yet</p>
              <button
                className={styles.browseButton}
                onClick={() => navigate("/requests/public")}
              >
                Browse Requests
              </button>
            </div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={styles.conversationCard}
                onClick={() => navigate(`/conversations/${conversation.id}`)}
              >
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.requestTitle}>
                      {conversation.requestDetails.title}
                    </h2>
                    <span className={styles.username}>
                      with {getOtherUserName(conversation)}
                    </span>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.timeContainer}>
                      <Clock className={styles.clockIcon} />
                      {formatDate(conversation.updated_at)}
                    </div>
                    <ChevronRight className={styles.chevronIcon} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ConversationsList;
