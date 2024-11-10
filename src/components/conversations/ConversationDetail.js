import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Send, ArrowLeft } from "lucide-react";
import styles from "./ConversationDetail.module.css";

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const token = useSelector((state) => state.auth.token);
  const currentUser = useSelector((state) => state.auth.user);
  const [lastMessageId, setLastMessageId] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;

  // Convert currentUser.id to number for comparison
  const userId = parseInt(currentUser.id);

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("Setting up conversation polling for ID:", id);
    fetchConversation();
    const interval = setInterval(() => {
      console.log("Polling for new messages...");
      fetchConversation();
    }, 2000);

    return () => {
      console.log("Cleaning up polling interval");
      clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);

  const fetchConversation = async () => {
    try {
      console.log("Fetching conversation:", id);
      const response = await axios.get(`${apiUrl}/conversations/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Conversation data:", response.data);
      console.log("Current user ID (number):", userId);
      console.log(
        "Message user IDs:",
        response.data.messages.map((m) => m.user_id)
      );

      // Check if we have new messages
      const latestMessageId =
        response.data.messages[response.data.messages.length - 1]?.id;
      if (latestMessageId !== lastMessageId) {
        setLastMessageId(latestMessageId);
        setConversation(response.data);
        scrollToBottom();
      }
    } catch (err) {
      console.error(
        "Error fetching conversation:",
        err.response?.data || err.message
      );
      setError("Failed to load conversation");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagePayload = {
      content: newMessage,
    };

    console.log("Sending message with payload:", messagePayload);

    try {
      const response = await axios.post(
        `${apiUrl}/conversations/${id}/messages`,
        messagePayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Message response:", response.data);
      setNewMessage("");

      // Add a small delay before fetching to ensure backend processing
      setTimeout(async () => {
        await fetchConversation();
      }, 500);
    } catch (err) {
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError("Failed to send message");
    }
  };

  if (!conversation) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>Loading conversation...</div>
      </div>
    );
  }

  const otherUser =
    userId === conversation.starter_user_id
      ? conversation.recipient_username
      : conversation.starter_username;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/conversations")}
        >
          <ArrowLeft size={20} />
        </button>
        <h2>{otherUser}</h2>
      </div>

      <div className={styles.messageContainer}>
        {conversation.messages.map((message) => {
          console.log("Rendering message:", {
            messageId: message.id,
            messageUserId: message.user_id,
            currentUserId: userId,
            isCurrentUser: message.user_id === userId,
          });

          return (
            <div
              key={message.id}
              className={`${styles.message} ${
                message.user_id === userId ? styles.sent : styles.received
              }`}
            >
              <div className={styles.messageContent}>
                {message.content}
                <span className={styles.messageTime}>
                  {formatTime(message.created_at)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form className={styles.inputContainer} onSubmit={sendMessage}>
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

      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};

export default ConversationDetail;
