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
        // Fetch projects separately
        const projectsRes = await api.get("/projects");
        console.log("Projects Response:", projectsRes.data);
        setProjects(projectsRes.data);

        // Try other requests separately to avoid Promise.all failing everything
        try {
          const requestsRes = await api.get("/requests");
          setRequests(requestsRes.data);
        } catch (error) {
          console.log("Requests fetch failed:", error);
          setRequests([]);
        }

        try {
          const conversationsRes = await api.get("/conversations/user/list");
          setConversations(conversationsRes.data);
        } catch (error) {
          console.log("Conversations fetch failed:", error);
          setConversations([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("Projects state updated:", projects);
  }, [projects]);

  // Add debug rendering
  console.log("Current projects state:", projects);

  return (
    <div className={styles.dashboard}>
      <Header />
      <div className={styles.content}>
        <h1>Client Dashboard</h1>

        {/* Debug info */}
        <div style={{ display: "none" }}>
          Debug - Projects count: {projects?.length || 0}
        </div>

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
