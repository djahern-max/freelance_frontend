import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";
import newsIcon from "../../images/news.png";
import videosIcon from "../../images/navigate_videos.png";
import notesIcon from "../../images/Notes.png"; // Add icon for Notes
import appsIcon from "../../images/Apps.png";
import logoutIcon from "../../images/Logout.png";

const API_URL = process.env.REACT_APP_API_URL;

const CreateProject = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("authToken");

  const createProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}/projects/`,
        { name: projectName, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setProjectName("");
      setDescription("");
      setSuccess("Project created successfully!");
      setError(null);
      // Redirect to /notes after success
      navigate("/notes");
    } catch (error) {
      setSuccess(null);
      setError("Failed to create project. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <div className={styles.createProjectContainer}>
      {/* Header navigation */}
      <div className={styles["icon-bar"]}>
        <img
          src={newsIcon}
          alt="News"
          title="Go to News"
          className={styles.icon}
          onClick={() => navigate("/newsletter-dashboard")}
        />
        <img
          src={notesIcon}
          alt="Notes"
          title="Go to Notes"
          className={styles.icon}
          onClick={() => navigate("/notes")}
        />
        <img
          src={videosIcon}
          alt="Videos"
          title="Go to Videos"
          className={styles.icon}
          onClick={() => navigate("/videos")}
        />
        <img
          src={appsIcon}
          alt="Projects"
          title="Go to Projects"
          className={styles.icon}
          onClick={() => navigate("/app-dashboard")}
        />
        <img
          src={logoutIcon}
          alt="Logout"
          title="Logout"
          className={styles.icon}
          onClick={handleLogout}
        />
      </div>

      <form className={styles.createProjectForm} onSubmit={createProject}>
        <h2>Create Project</h2>
        {error && <p className={styles.errorMessage}>{error}</p>}
        {success && <p className={styles.successMessage}>{success}</p>}
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name"
          required
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (Optional)"
        />
        <button type="submit">Create Project</button>
      </form>
    </div>
  );
};

export default CreateProject;
