// src/components/pages/ProjectDetails.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FileText,
  MessageSquare,
  Settings,
  Plus,
  Calendar,
  Users,
  Clock,
  ArrowLeft,
} from "lucide-react";
import api from "../../utils/api";
import Header from "../shared/Header";
import styles from "./ProjectDetails.module.css";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("requests");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get(`/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  if (loading) {
    return <div className={styles.loading}>Loading project details...</div>;
  }

  if (!project) {
    return <div className={styles.error}>Project not found</div>;
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        {/* Back Button */}
        <button
          className={styles.backButton}
          onClick={() => navigate("/client-dashboard")}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* Project Header */}
        <div className={styles.projectHeader}>
          <div className={styles.titleSection}>
            <h1>{project.name}</h1>
            <p className={styles.description}>{project.description}</p>
          </div>
          <button className={styles.settingsButton}>
            <Settings size={16} />
          </button>
        </div>

        {/* Project Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <FileText className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Requests</h3>
              <p>0</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <MessageSquare className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Active Conversations</h3>
              <p>0</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <Users className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Team Members</h3>
              <p>1</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <Clock className={styles.icon} />
            <div className={styles.statInfo}>
              <h3>Last Activity</h3>
              <p>Today</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button className={styles.primaryButton}>
            <Plus size={16} />
            New Request
          </button>
          <button className={styles.secondaryButton}>
            <Users size={16} />
            Invite Team Member
          </button>
        </div>

        {/* Content Tabs */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsList}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "requests" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("requests")}
            >
              Requests
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "conversations" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("conversations")}
            >
              Conversations
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "timeline" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("timeline")}
            >
              Timeline
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "requests" && (
              <div className={styles.requestsTab}>
                <div className={styles.emptyState}>
                  <FileText size={48} />
                  <h3>No Requests Yet</h3>
                  <p>Create your first request to get started</p>
                  <button className={styles.primaryButton}>
                    <Plus size={16} />
                    New Request
                  </button>
                </div>
              </div>
            )}
            {/* Add other tab contents similarly */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
