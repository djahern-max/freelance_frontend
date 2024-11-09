import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./VideoUpload.module.css";
import navigateIcon from "../../images/navigate_videos.png";
import Header from "../shared/Header";

const VideoUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("thumbnail", thumbnail);

    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.post(`${apiUrl}/videos/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setUploadStatus("success");
    } catch (error) {
      setUploadStatus("error");
    }
  };

  const handleNavigate = () => {
    navigate("/videos");
  };

  return (
    <div className={styles.videoUploadContainer}>
      <div className={styles.headerContainer}>
        <Header />
      </div>
      <div className={styles.formContainer}>
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
            <label>Video File:</label>
            <div className={styles.fileUploadWrapper}>
              <input
                type="file"
                onChange={handleFileChange}
                accept="video/*"
                className={styles.hiddenInput}
                id="videoFile"
                required
              />
              <label htmlFor="videoFile" className={styles.fileUploadButton}>
                Choose Video File
              </label>
              {file && <span className={styles.fileName}>{file.name}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Thumbnail:</label>
            <div className={styles.fileUploadWrapper}>
              <input
                type="file"
                onChange={handleThumbnailChange}
                accept="image/*"
                className={styles.hiddenInput}
                id="thumbnailFile"
                required
              />
              <label
                htmlFor="thumbnailFile"
                className={styles.fileUploadButton}
              >
                Choose Thumbnail
              </label>
              {thumbnail && (
                <span className={styles.fileName}>{thumbnail.name}</span>
              )}
            </div>
          </div>

          <button type="submit" className={styles.uploadButton}>
            Upload Video
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
