import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Header from "../shared/Header";
import { Activity, MessageSquare, Plus, FileText } from "lucide-react";
import styles from "./ClientDashboard.module.css";
import { ChevronRight } from "lucide-react";

const ClientDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch requests with debugging
        try {
          console.log("Fetching requests...");
          const requestsRes = await api.get("/requests");
          console.log("Raw requests response:", requestsRes);

          // Log the content type
          console.log(
            "Response content type:",
            requestsRes.headers["content-type"]
          );

          if (
            requestsRes.headers["content-type"].includes("application/json")
          ) {
            if (Array.isArray(requestsRes.data)) {
              setRequests(requestsRes.data);
            } else {
              console.error(
                "Expected an array for requests but received:",
                requestsRes.data
              );
              setRequests([]);
            }
          } else {
            console.error(
              "Received non-JSON response:",
              requestsRes.headers["content-type"]
            );
            setRequests([]);
          }
        } catch (error) {
          console.log("Requests fetch failed:", {
            error,
            response: error.response,
            status: error.response?.status,
            data: error.response?.data,
          });
          setRequests([]);
        }

        // ... rest of your code
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.content}>
        <h1>Client Dashboard</h1>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Activity className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Projects</h3>
              <p>{projects?.length || 0}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <FileText className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Open Requests</h3>
              <p>{requests.length}</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <MessageSquare className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Conversations</h3>
              <p>{conversations.length}</p>
            </div>
          </div>
        </div>

        <div className={styles.actionsGrid}>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/create-project")}
          >
            <Plus className={styles.buttonIcon} />
            New Project
          </button>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/requests")}
          >
            <FileText className={styles.buttonIcon} />
            View Requests
          </button>
          <button
            className={styles.actionButton}
            onClick={() => navigate("/conversations")}
          >
            <MessageSquare className={styles.buttonIcon} />
            View Conversations
          </button>
        </div>

        <div className={styles.projectsList}>
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <div key={project.id} className={styles.projectCard}>
                <h3>{project.name || "Unnamed Project"}</h3>
                <p>{project.description || "No description"}</p>
                <button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className={styles.viewButton}
                >
                  View Details
                  <ChevronRight size={16} />
                </button>
              </div>
            ))
          ) : (
            <div className={styles.noProjects}>No projects found</div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ClientDashboard;
