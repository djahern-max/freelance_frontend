import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./VideoUpload.module.css";
import navigateIcon from "../../images/navigate_videos.png";

const VideoUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isProject, setIsProject] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("is_project", isProject);
    formData.append("file", file);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found, please log in again.");
      }

      const response = await axios.post(`${apiUrl}/videos/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Add the token here
        },
      });
      console.log("Upload successful:", response.data);
      setUploadStatus("success");
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadStatus("error");
    }
  };

  const handleNavigate = () => {
    navigate("/videos");
  };

  return (
    <div className={styles.videoUploadContainer}>
      <form className={styles.videoUploadForm} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h2>Upload Video</h2>
          <button
            className={styles.navigateIconButton}
            onClick={handleNavigate}
            type="button"
          >
            <img
              src={navigateIcon}
              alt="Go to Videos"
              className={styles.navigateIcon}
            />
          </button>
        </div>
        {uploadStatus === "success" && (
          <div className={styles.successMessage}>Upload successful!</div>
        )}
        {uploadStatus === "error" && (
          <div className={styles.errorMessage}>Error uploading video.</div>
        )}
        <div className={styles.formGroup}>
          <label>Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label>File:</label>
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/*"
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Upload Video
        </button>
      </form>
    </div>
  );
};

export default VideoUpload;
