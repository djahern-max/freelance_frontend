import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../../utils/api";
import Header from "../shared/Header";
import {
  Activity,
  MessageSquare,
  Plus,
  FileText,
  ChevronRight,
} from "lucide-react";
import styles from "./ClientDashboard.module.css";

const ClientDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    requests: [],
    conversations: [],
  });
  const [loadingStates, setLoadingStates] = useState({
    projects: true,
    requests: true,
    conversations: true,
  });
  const [errors, setErrors] = useState({
    projects: null,
    requests: null,
    conversations: null,
  });
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setErrors({
      projects: null,
      requests: null,
      conversations: null,
    });

    fetchProjects();
    fetchRequests();
    fetchConversations();
  };

  const fetchProjects = async () => {
    try {
      const projectsRes = await api.get("/projects/");
      setDashboardData((prev) => ({
        ...prev,
        projects: Array.isArray(projectsRes.data) ? projectsRes.data : [],
      }));
    } catch (error) {
      console.error("Projects fetch failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setErrors((prev) => ({
        ...prev,
        projects: "Unable to load projects. Please try again later.",
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, projects: false }));
    }
  };

  const fetchRequests = async () => {
    try {
      const requestsRes = await api.get("/requests/");
      setDashboardData((prev) => ({
        ...prev,
        requests: Array.isArray(requestsRes.data) ? requestsRes.data : [],
      }));
    } catch (error) {
      console.error("Requests fetch failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setErrors((prev) => ({
        ...prev,
        requests: "Unable to load requests. Please try again later.",
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, requests: false }));
    }
  };

  const fetchConversations = async () => {
    try {
      const conversationsRes = await api.get("/conversations/user/list");
      setDashboardData((prev) => ({
        ...prev,
        conversations: Array.isArray(conversationsRes.data)
          ? conversationsRes.data
          : [],
      }));
    } catch (error) {
      console.error("Conversations fetch failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      setErrors((prev) => ({
        ...prev,
        conversations: "Unable to load conversations. Please try again later.",
      }));
    } finally {
      setLoadingStates((prev) => ({ ...prev, conversations: false }));
    }
  };

  const isLoading = Object.values(loadingStates).some((state) => state);

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading your dashboard...</div>
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

        {Object.entries(errors).map(
          ([key, error]) =>
            error && (
              <div key={key} className={styles.error}>
                {error}
              </div>
            )
        )}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <Activity className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Projects</h3>
              <p>{dashboardData.projects.length || 0}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <FileText className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Open Requests</h3>
              <p>{dashboardData.requests.length || 0}</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <MessageSquare className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Conversations</h3>
              <p>{dashboardData.conversations.length || 0}</p>
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
          {!errors.projects && dashboardData.projects.length > 0 ? (
            dashboardData.projects.map((project) => (
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
            <div className={styles.noProjects}>
              {errors.projects ? (
                <button onClick={fetchProjects} className={styles.retryButton}>
                  Retry Loading Projects
                </button>
              ) : (
                "No projects found. Create your first project to get started!"
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
