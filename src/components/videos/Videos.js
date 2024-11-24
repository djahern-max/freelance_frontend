import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Upload } from "lucide-react";
import Header from "../shared/Header";
import styles from "./Videos.module.css";

// Separate VideoItem component
const VideoItem = ({ video }) => {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className={styles["video-item"]}>
      <h3>{video.title}</h3>
      <p>{video.description}</p>

      {!showVideo ? (
        <div
          className={styles["thumbnail-container"]}
          onClick={() => setShowVideo(true)}
        >
          <img src={video.thumbnail_path} alt="Video Thumbnail" />
          <div className={styles["play-overlay"]}>Click to play</div>
        </div>
      ) : (
        <video controls>
          <source src={video.url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
};

// Main Videos component
const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Token not found. Please log in again.");
      }

      const constructedUrl = `${apiUrl}/video_display/spaces`;
      const response = await axios.get(constructedUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVideos(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to fetch videos. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <Header />
        <div className={styles.mainContent}>
          <div className={styles["loading-spinner"]}>Loading videos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <Header />
      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.title}>Videos</h1>
          <button
            className={styles["upload-button"]}
            onClick={() => navigate("/video-upload")}
          >
            <Upload size={24} />
            <span>Upload Video</span>
          </button>
        </div>

        {error && <div className={styles["error-message"]}>{error}</div>}

        <div className={styles["video-list"]}>
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <VideoItem key={index} video={video} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No videos available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;
