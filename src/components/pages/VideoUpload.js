import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Image, FileVideo } from "lucide-react";
import Header from "../shared/Header";
import styles from "./VideoUpload.module.css";

const VideoUpload = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (type === "video") {
      setFile(selectedFile);
    } else {
      setThumbnail(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);
    formData.append("thumbnail", thumbnail);

    try {
      const token = localStorage.getItem("authToken");
      await axios.post(`${apiUrl}/videos/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setUploadStatus("success");
      setTimeout(() => navigate("/videos"), 2000);
    } catch (error) {
      setUploadStatus("error");
    }
  };

  return (
    <div className={styles.videoUploadContainer}>
      <Header />
      <div className={styles.formContainer}>
        <form className={styles.videoUploadForm} onSubmit={handleSubmit}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>Upload Video</h1>
            <button
              type="button"
              className={styles.navigateButton}
              onClick={() => navigate("/videos")}
            >
              <ArrowLeft size={20} />
              Back to Videos
            </button>
          </div>

          {uploadStatus && (
            <div
              className={
                uploadStatus === "success"
                  ? styles.successMessage
                  : styles.errorMessage
              }
            >
              {uploadStatus === "success"
                ? "Upload successful! Redirecting..."
                : "Error uploading video. Please try again."}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Video File</label>
            <div className={styles.fileUploadWrapper}>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "video")}
                accept="video/*"
                className={styles.hiddenInput}
                id="videoFile"
                required
              />
              <label htmlFor="videoFile" className={styles.fileUploadButton}>
                <FileVideo size={20} />
                Choose Video File
              </label>
              {file && <span className={styles.fileName}>{file.name}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Thumbnail</label>
            <div className={styles.fileUploadWrapper}>
              <input
                type="file"
                onChange={(e) => handleFileChange(e, "thumbnail")}
                accept="image/*"
                className={styles.hiddenInput}
                id="thumbnailFile"
                required
              />
              <label
                htmlFor="thumbnailFile"
                className={styles.fileUploadButton}
              >
                <Image size={20} />
                Choose Thumbnail
              </label>
              {thumbnail && (
                <span className={styles.fileName}>{thumbnail.name}</span>
              )}
            </div>
          </div>

          <button type="submit" className={styles.uploadButton}>
            <Upload size={20} />
            Upload Video
          </button>
        </form>
      </div>
    </div>
  );
};

export default VideoUpload;
