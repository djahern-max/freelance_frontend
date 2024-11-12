import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  MessageSquare,
  Clock,
  User,
  DollarSign,
  Briefcase,
} from "lucide-react";
import Header from "../shared/Header";
import styles from "./ConversationsList.module.css";

const ConversationsList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

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
            console.error(`Error fetching request details:`, err);
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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const getOtherUserName = (conversation) => {
    return user.id === conversation.starter_user_id
      ? conversation.recipient_username
      : conversation.starter_username;
  };

  const getOtherUserRole = (conversation) => {
    return user.userType === "client" ? "Developer" : "Client";
  };

  const getFilteredConversations = () => {
    if (activeFilter === "all") return conversations;
    return conversations.filter((conv) => conv.status === activeFilter);
  };

  const renderConversationCard = (conversation) => {
    const otherUser = getOtherUserName(conversation);
    const otherUserRole = getOtherUserRole(conversation);
    const requestDetails = conversation.requestDetails;

    return (
      <div
        key={conversation.id}
        className={styles.conversationCard}
        onClick={() => navigate(`/conversations/${conversation.id}`)}
      >
        <div className={styles.cardContent}>
          <div className={styles.cardHeader}>
            <h2 className={styles.requestTitle}>{requestDetails.title}</h2>
            <span className={`${styles.status} ${styles[conversation.status]}`}>
              {conversation.status}
            </span>
          </div>

          <div className={styles.userInfo}>
            <User className={styles.icon} />
            <span className={styles.userName}>
              {otherUser} ({otherUserRole})
            </span>
          </div>

          {user.userType === "developer" && (
            <div className={styles.budgetInfo}>
              <DollarSign className={styles.icon} />
              <span>Budget: ${requestDetails.estimated_budget}</span>
            </div>
          )}

          <div className={styles.timeInfo}>
            <Clock className={styles.icon} />
            <span>
              Last activity:{" "}
              {new Date(conversation.updated_at).toLocaleDateString()}
            </span>
          </div>

          {conversation.unread_count > 0 && (
            <div className={styles.unreadBadge}>
              {conversation.unread_count} new
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading conversations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Conversations</h1>
          {user.userType === "developer" && (
            <button
              className={styles.browseButton}
              onClick={() => navigate("/public-requests")}
            >
              <Briefcase className={styles.icon} />
              Browse Opportunities
            </button>
          )}
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.filterButton} ${
              activeFilter === "all" ? styles.active : ""
            }`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${
              activeFilter === "active" ? styles.active : ""
            }`}
            onClick={() => setActiveFilter("active")}
          >
            Active
          </button>
          <button
            className={`${styles.filterButton} ${
              activeFilter === "pending" ? styles.active : ""
            }`}
            onClick={() => setActiveFilter("pending")}
          >
            Pending
          </button>
          <button
            className={`${styles.filterButton} ${
              activeFilter === "completed" ? styles.active : ""
            }`}
            onClick={() => setActiveFilter("completed")}
          >
            Completed
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.conversationsList}>
          {getFilteredConversations().length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquare className={styles.emptyIcon} />
              <p className={styles.emptyText}>No conversations found</p>
              {user.userType === "developer" && (
                <button
                  className={styles.browseButton}
                  onClick={() => navigate("/public-requests")}
                >
                  Browse Opportunities
                </button>
              )}
            </div>
          ) : (
            getFilteredConversations().map(renderConversationCard)
          )}
        </div>
      </main>
    </div>
  );
};

export default ConversationsList;
