import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import styles from "./CreateProject.module.css";
import Header from "../shared/Header";

const CreateProject = () => {
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const createProject = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/projects/", {
        name: projectName,
        description,
      });

      setSuccess("Project created successfully!");
      setError(null);

      // Clear form
      setProjectName("");
      setDescription("");

      // Show success message briefly before redirecting
      setTimeout(() => {
        navigate("/client-dashboard"); // Redirect to client dashboard instead of requests
      }, 1500);
    } catch (error) {
      console.error("Project creation error:", error);
      setSuccess(null);
      setError(
        error.response?.data?.detail ||
          "Failed to create project. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Project</h1>
          <p className={styles.subtitle}>
            Create a new project to manage your requests
          </p>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && (
          <div className={styles.success}>
            {success}
            <div className={styles.redirectMessage}>
              Redirecting to dashboard...
            </div>
          </div>
        )}

        <form className={styles.form} onSubmit={createProject}>
          <div className={styles.formGroup}>
            <label htmlFor="projectName" className={styles.label}>
              Project Name
            </label>
            <input
              id="projectName"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className={styles.input}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description" className={styles.label}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
              rows="4"
              placeholder="Optional project description"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`${styles.submitButton} ${
              isLoading ? styles.loading : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Creating Project..." : "Create Project"}
          </button>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate("/client-dashboard")}
            disabled={isLoading}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
