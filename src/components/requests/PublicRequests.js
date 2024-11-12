import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MessageSquare,
  Users,
  Clock,
  Tag,
  DollarSign,
  Loader,
} from "lucide-react";
import Header from "../shared/Header";
import AuthDialog from "../auth/AuthDialog";
import api from "../../utils/api";
import styles from "./PublicRequests.module.css";

const PublicRequests = () => {
  const [publicRequests, setPublicRequests] = useState([]);
  const [conversations, setConversations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestsResponse = await api.get("/requests/public");
      console.log("Public requests:", requestsResponse.data);

      if (isAuthenticated) {
        const conversationsResponse = await api.get("/conversations/user/list");
        const conversationCounts = conversationsResponse.data.reduce(
          (acc, conv) => {
            acc[conv.request_id] = (acc[conv.request_id] || 0) + 1;
            return acc;
          },
          {}
        );
        setConversations(conversationCounts);
      }

      setPublicRequests(requestsResponse.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.detail || "Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleStartConversation = async (request) => {
    if (!isAuthenticated) {
      setSelectedRequest(request);
      setShowAuthDialog(true);
      return;
    }

    if (user?.userType !== "developer") {
      setError("Only developers can respond to requests");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/conversations/", {
        request_id: request.id,
        message: "I'm interested in helping with your project",
      });

      navigate(`/conversations/${response.data.id}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError(err.response?.data?.detail || "Failed to start conversation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.spinner} />
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Available Requests</h1>
        </div>

        {error && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}

        <div className={styles.requestsGrid}>
          {publicRequests.map((request) => (
            <div key={request.id} className={styles.requestCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.requestTitle}>{request.title}</h2>
                {request.estimated_budget && (
                  <div className={styles.budget}>
                    <DollarSign className={styles.icon} />$
                    {request.estimated_budget.toLocaleString()}
                  </div>
                )}
              </div>

              <p className={styles.description}>{request.content}</p>

              <div className={styles.metaInfo}>
                <div className={styles.metaItem}>
                  <Clock className={styles.icon} />
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
                <div className={styles.metaItem}>
                  <MessageSquare className={styles.icon} />
                  {conversations[request.id] || 0} responses
                </div>
                {request.owner_username && (
                  <div className={styles.metaItem}>
                    <Users className={styles.icon} />
                    {request.owner_username}
                  </div>
                )}
              </div>

              <div className={styles.cardActions}>
                {!isAuthenticated ? (
                  <button
                    className={styles.buttonPrimary}
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowAuthDialog(true);
                    }}
                  >
                    Sign In to Respond
                  </button>
                ) : user?.userType === "developer" ? (
                  <button
                    className={styles.buttonPrimary}
                    onClick={() => handleStartConversation(request)}
                  >
                    Respond to Request
                  </button>
                ) : (
                  <button
                    className={styles.buttonOutline}
                    onClick={() => navigate(`/requests/${request.id}`)}
                  >
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => {
            setShowAuthDialog(false);
            setSelectedRequest(null);
          }}
          onLogin={() =>
            navigate("/login", {
              state: {
                from: location.pathname,
                requestId: selectedRequest?.id,
              },
            })
          }
          onRegister={() =>
            navigate("/register", {
              state: {
                from: location.pathname,
                requestId: selectedRequest?.id,
              },
            })
          }
        />
      </main>
    </div>
  );
};

export default PublicRequests;
