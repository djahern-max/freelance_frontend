import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { MessageSquare, X } from "lucide-react";
import styles from "./ConversationNotifications.module.css";

const ConversationSection = ({ apiUrl }) => {
  const [allConversations, setAllConversations] = useState([]);
  const [newConversations, setNewConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return "Recent";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recent";

      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // If less than 1 hour ago
      if (diffMinutes < 60) {
        return diffMinutes === 0 ? "Just now" : `${diffMinutes}m ago`;
      }

      // If less than 24 hours ago
      if (diffHours < 24) {
        return `${diffHours}h ago`;
      }

      // If yesterday
      if (diffDays === 1) {
        return "Yesterday";
      }

      // If within the last 7 days
      if (diffDays < 7) {
        return `${diffDays} days ago`;
      }

      // Otherwise return formatted date
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Date parsing error:", error);
      return "Recent";
    }
  };

  const fetchConversations = async () => {
    if (!token || !user) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${apiUrl}/conversations/user/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const processedConversations = response.data.map((conv) => ({
        ...conv,
        updated_at:
          conv.updated_at || conv.created_at || new Date().toISOString(),
      }));

      setAllConversations(processedConversations);

      // Filter for conversations updated in the last 24 hours AND unread
      const unreadConversations = processedConversations.filter((conv) => {
        const isUnread =
          conv.recipient_user_id === parseInt(user.id) &&
          (!conv.last_read_at ||
            new Date(conv.last_read_at) < new Date(conv.updated_at));

        // Check if the conversation was updated in the last 24 hours
        const isRecent =
          new Date(conv.updated_at) >
          new Date(Date.now() - 24 * 60 * 60 * 1000);

        return isUnread && isRecent;
      });

      setNewConversations(unreadConversations);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [token, user, apiUrl]);

  const markAsRead = async (conversationId) => {
    try {
      await axios.post(`${apiUrl}/conversations/${conversationId}/read`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update local state to reflect the read status
      setAllConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, last_read_at: new Date().toISOString() }
            : conv
        )
      );

      setNewConversations((prev) =>
        prev.filter((conv) => conv.id !== conversationId)
      );
    } catch (error) {
      console.error("Error marking conversation as read:", error);
    }
  };

  const navigateToConversation = async (conversationId) => {
    await markAsRead(conversationId);
    navigate(`/conversations/${conversationId}`);
  };

  const handleDelete = async (e, conversationId) => {
    e.stopPropagation(); // Prevent navigation
    if (confirmDelete === conversationId) {
      try {
        await axios.delete(`${apiUrl}/conversations/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
        setNewConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId)
        );
      } catch (error) {
        console.error("Error deleting conversation:", error);
      }
    } else {
      setConfirmDelete(conversationId);
      // Auto-reset confirm state after 3 seconds
      setTimeout(() => {
        setConfirmDelete(null);
      }, 3000);
    }
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}>
        Conversations
        {newConversations.length > 0 && (
          <span className={styles.newBadge}>{newConversations.length} new</span>
        )}
      </h2>

      {loading ? (
        <div className={styles.loadingText}>Loading conversations...</div>
      ) : (
        <ul className={styles.conversationsList}>
          {allConversations.slice(0, 5).map((conv) => {
            const isNew = newConversations.some(
              (newConv) => newConv.id === conv.id
            );
            return (
              <li
                key={conv.id}
                className={`${styles.conversationItem} ${
                  isNew ? styles.unread : ""
                }`}
                onClick={() => navigateToConversation(conv.id)}
              >
                <div className={styles.conversationContent}>
                  <MessageSquare className={styles.messageIcon} />
                  <span className={styles.conversationText}>
                    {conv.starter_user_id === parseInt(user.id)
                      ? `Chat with ${conv.recipient_username}`
                      : `Chat with ${conv.starter_username}`}
                    {isNew && (
                      <span className={styles.newIndicator}> (New)</span>
                    )}
                  </span>
                  <button
                    className={`${styles.deleteButton} ${
                      confirmDelete === conv.id ? styles.deleteConfirm : ""
                    }`}
                    onClick={(e) => handleDelete(e, conv.id)}
                    title={
                      confirmDelete === conv.id
                        ? "Click again to confirm delete"
                        : "Delete conversation"
                    }
                  >
                    <X className={styles.deleteIcon} />
                  </button>
                </div>
                <span className={styles.conversationTime}>
                  {formatDate(conv.updated_at)}
                </span>
              </li>
            );
          })}
          {allConversations.length === 0 && (
            <div className={styles.emptyState}>No conversations yet</div>
          )}
        </ul>
      )}
    </div>
  );
};

export default ConversationSection;
