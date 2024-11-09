import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./CreateProject.module.css";
import Header from "../shared/Header";

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
      navigate("/requests");
    } catch (error) {
      setSuccess(null);
      setError("Failed to create project. Please try again.");
    }
  };

  return (
    <div>
      <Header />
      <div className={styles.createProjectContainer}>
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
    </div>
  );
};

export default CreateProject;
