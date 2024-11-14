import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, MessageSquare, Briefcase, Star } from "lucide-react";
import Header from "../shared/Header";
import api from "../../utils/api";
import styles from "./DeveloperDashboard.module.css";

// New RequestCard component
const RequestCard = ({ request, navigate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 150;
  const needsTruncation = request.content.length > maxLength;

  return (
    <div className={styles.requestCard}>
      <h3>{request.title}</h3>
      <p className={styles.requestContent}>
        {isExpanded || !needsTruncation
          ? request.content
          : `${request.content.substring(0, maxLength)}...`}
        {needsTruncation && (
          <button
            className={styles.viewMoreButton}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "View less" : "View more"}
          </button>
        )}
      </p>
      <div className={styles.requestMeta}>
        {request.estimated_budget && (
          <span>Budget: ${request.estimated_budget}</span>
        )}
        <span>Posted: {new Date(request.created_at).toLocaleDateString()}</span>
      </div>
      <button
        onClick={() => navigate(`/requests/${request.id}`)}
        className={styles.viewButton}
      >
        View Details
      </button>
    </div>
  );
};

const DeveloperDashboard = () => {
  const [activeRequests, setActiveRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const requestsRes = await api.get("/requests/public");
        setActiveRequests(requestsRes.data || []);

        const conversationsRes = await api.get("/conversations/user/list");
        setConversations(conversationsRes.data || []);

        setError(null);
      } catch (err) {
        console.error("API Error:", err);
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          navigate("/login");
        } else {
          setError("Unable to load dashboard data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (auth.token) {
      fetchDashboardData();
    } else {
      setError("Authentication required");
      setLoading(false);
    }
  }, [auth, navigate]);

  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.content}>
          <div className={styles.error}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      <div className={styles.content}>
        <h1 className={styles.dashboardTitle}>
          {user?.fullName ? `${user.fullName}'s Dashboard` : "Dashboard"}
        </h1>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Briefcase className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Available Opportunities</h3>
              <p>{activeRequests.length}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <MessageSquare className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Conversations</h3>
              <p>{conversations.length}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <Star className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Projects</h3>
              <p>
                {conversations.filter((c) => c.status === "accepted").length}
              </p>
            </div>
          </div>
        </div>

        <div className={styles.actionsGrid}>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/public-requests")}
          >
            <Search className={styles.buttonIcon} />
            Browse Opportunities
          </button>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/conversations")}
          >
            <MessageSquare className={styles.buttonIcon} />
            View Conversations
          </button>
        </div>

        <div className={styles.recentActivity}>
          <h2>Recent Opportunities</h2>
          {activeRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No public requests available at the moment.</p>
              <p>Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className={styles.requestsList}>
              {activeRequests.slice(0, 5).map((request) => {
                console.log("Request data:", request);
                return (
                  <RequestCard
                    key={request.id}
                    request={request}
                    navigate={navigate}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperDashboard;
