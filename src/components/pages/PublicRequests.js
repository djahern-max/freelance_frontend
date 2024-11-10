import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { MessageSquare, Lock, Users, Clock } from "lucide-react";
import Header from "../shared/Header";
import AuthDialog from "../../../src/components/auth/AuthDialog";
import styles from "./PublicRequests.module.css";

const PublicRequests = () => {
  const [publicRequests, setPublicRequests] = useState([]);
  const [error, setError] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = process.env.REACT_APP_API_URL;

  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    fetchPublicRequests();
  }, []);

  const fetchPublicRequests = async () => {
    try {
      const response = await axios.get(`${apiUrl}/requests/public`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPublicRequests(response.data);
    } catch (err) {
      console.error("Error fetching public requests:", err);
      setError("Failed to fetch public requests.");
    }
  };

  const handleStartConversation = async (request) => {
    if (!token) {
      setShowAuthDialog(true);
      return;
    }

    try {
      // Log the request data for debugging
      console.log("Starting conversation for request:", {
        requestId: request.id,
        requestOwnerId: request.user_id,
        currentUserId: user.id,
      });

      // Make sure we're not starting a conversation with ourselves
      if (parseInt(user.id) === request.user_id) {
        setError("You cannot start a conversation with yourself");
        return;
      }

      const payload = {
        request_id: request.id,
      };

      const response = await axios.post(`${apiUrl}/conversations/`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Conversation created:", response.data);
      navigate(`/conversations/${response.data.id}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
    }
  };

  const handleLogin = () => {
    navigate("/login", {
      state: { from: location.pathname },
    });
    setShowAuthDialog(false);
  };

  const handleRegister = () => {
    navigate("/register", {
      state: { from: location.pathname },
    });
    setShowAuthDialog(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className={styles.mainContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Public Requests</h1>
          <div className={styles.activeRequests}>
            <Users className={styles.icon} />
            <span className={styles.requestCount}>
              {publicRequests.length} Active Requests
            </span>
          </div>
        </div>

        {error && !showAuthDialog && (
          <div className={styles.alert}>
            <p>{error}</p>
          </div>
        )}

        <div className={styles.grid}>
          {publicRequests.map((request) => (
            <div key={request.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>{request.title}</h2>
                <p className={styles.cardOwner}>by {request.owner_username}</p>
                {request.contains_sensitive_data && (
                  <Lock className={styles.lockIcon} />
                )}
              </div>

              <p className={styles.cardContent}>{request.content}</p>

              <div className={styles.infoContainer}>
                <div className={styles.dateContainer}>
                  <Clock className={styles.clockIcon} />
                  {formatDate(request.created_at)}
                </div>
                <div className={styles.commentContainer}>
                  <MessageSquare className={styles.commentIcon} />
                  {request.comment_count || 0} responses
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  className={styles.buttonOutline}
                  onClick={() => navigate(`/requests/${request.id}`)}
                >
                  View Details
                </button>

                {parseInt(user.id) === request.user_id ? (
                  // If this is the user's own request, show responses button
                  <div className={styles.responseSection}>
                    <button
                      className={styles.buttonDefault}
                      onClick={() =>
                        navigate(`/requests/responses?request=${request.id}`)
                      }
                    >
                      View Responses ({request.comment_count || 0})
                    </button>
                  </div>
                ) : (
                  // For other users, show the Start Conversation button
                  <button
                    className={styles.buttonDefault}
                    onClick={() => handleStartConversation(request)}
                  >
                    Start Conversation
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {publicRequests.length === 0 && (
          <div className={styles.noRequestsContainer}>
            <MessageSquare className={styles.noRequestsIcon} />
            <p className={styles.noRequestsText}>
              No public requests available at this time.
            </p>
          </div>
        )}

        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => setShowAuthDialog(false)}
          error={error}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </main>
    </div>
  );
};

export default PublicRequests;
