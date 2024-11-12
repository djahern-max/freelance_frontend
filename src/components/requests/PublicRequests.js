import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { MessageSquare, Users, Clock, Tag, DollarSign } from "lucide-react";
import Header from "../shared/Header";
import AuthDialog from "../auth/AuthDialog";
import api from "../../utils/api"; // Use the centralized API utility
import styles from "./PublicRequests.module.css";

const PublicRequests = () => {
  const [publicRequests, setPublicRequests] = useState([]);
  const [conversations, setConversations] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [filters, setFilters] = useState({
    budget: "all",
    timeframe: "all",
    skills: [],
  });

  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const fetchData = async () => {
    try {
      const requestsResponse = await api.get("/requests/public");

      if (token) {
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
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleStartConversation = async (request) => {
    if (!token) {
      setShowAuthDialog(true);
      return;
    }

    if (user?.userType !== "developer") {
      setError("Only developers can respond to requests");
      return;
    }

    try {
      if (parseInt(user.id) === request.user_id) {
        setError("You cannot start a conversation with yourself");
        return;
      }

      const response = await api.post("/conversations/", {
        request_id: request.id,
      });

      await fetchData();
      navigate(`/conversations/${response.data.id}`);
    } catch (err) {
      console.error("Error starting conversation:", err);
      setError("Failed to start conversation");
    }
  };

  const renderRequestActions = (request) => {
    if (!user) {
      return (
        <button
          className={styles.buttonPrimary}
          onClick={() => setShowAuthDialog(true)}
        >
          Sign In to Respond
        </button>
      );
    }

    if (user.userType === "developer") {
      if (parseInt(user.id) === request.user_id) {
        return (
          <button
            className={styles.buttonOutline}
            onClick={() =>
              navigate(`/requests/responses?request=${request.id}`)
            }
          >
            View Your Request
          </button>
        );
      }
      return (
        <button
          className={styles.buttonPrimary}
          onClick={() => handleStartConversation(request)}
        >
          Respond to Request
        </button>
      );
    }

    return (
      <button
        className={styles.buttonOutline}
        onClick={() => navigate(`/requests/${request.id}`)}
      >
        View Details
      </button>
    );
  };

  const filterRequests = (requests) => {
    return requests.filter((request) => {
      if (filters.budget !== "all") {
        const budget = Number(request.estimated_budget);
        switch (filters.budget) {
          case "under5k":
            if (budget >= 5000) return false;
            break;
          case "5k-10k":
            if (budget < 5000 || budget > 10000) return false;
            break;
          case "over10k":
            if (budget <= 10000) return false;
            break;
          default:
            break;
        }
      }
      return true;
    });
  };

  return (
    <div className={styles.mainContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>Available Requests</h1>
          {user?.userType === "developer" && (
            <div className={styles.filterSection}>
              <select
                value={filters.budget}
                onChange={(e) =>
                  setFilters({ ...filters, budget: e.target.value })
                }
                className={styles.filterSelect}
              >
                <option value="all">All Budgets</option>
                <option value="under5k">Under $5,000</option>
                <option value="5k-10k">$5,000 - $10,000</option>
                <option value="over10k">Over $10,000</option>
              </select>
            </div>
          )}
        </div>

        {error && !showAuthDialog && (
          <div className={styles.alert} role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className={styles.loadingContainer}>
            <p>Loading requests...</p>
          </div>
        ) : (
          <div className={styles.requestsGrid}>
            {filterRequests(publicRequests).map((request) => (
              <div key={request.id} className={styles.requestCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.requestTitle}>{request.title}</h2>
                  <div className={styles.budget}>
                    <DollarSign className={styles.icon} />$
                    {request.estimated_budget.toLocaleString()}
                  </div>
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
                  {request.required_skills && (
                    <div className={styles.skills}>
                      <Tag className={styles.icon} />
                      {request.required_skills.map((skill, index) => (
                        <span key={index} className={styles.skill}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.cardActions}>
                  {renderRequestActions(request)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && publicRequests.length === 0 && (
          <div className={styles.emptyState}>
            <MessageSquare className={styles.emptyIcon} />
            <p>No public requests available at this time.</p>
          </div>
        )}

        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => setShowAuthDialog(false)}
          onLogin={() =>
            navigate("/login", { state: { from: location.pathname } })
          }
          onRegister={() =>
            navigate("/register", { state: { from: location.pathname } })
          }
        />
      </main>
    </div>
  );
};

export default PublicRequests;
