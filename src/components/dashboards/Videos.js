import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Videos.module.css";
import uploadIcon from "../../images/upload.png";
import newsIcon from "../../images/news.png";
import notesIcon from "../../images/Notes.png";
import appsIcon from "../../images/Apps.png";
import logoutIcon from "../../images/Logout.png";
import { useNavigate } from "react-router-dom";

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
      console.log("Environment:", process.env.NODE_ENV);
      console.log("API_URL:", apiUrl);
      console.log("Constructed URL:", constructedUrl);
      console.log("Auth token:", token);

      const response = await axios.get(constructedUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setVideos(Array.isArray(response.data) ? response.data : []);

      // Log the response data
      console.log("Fetched videos:", response.data);
    } catch (err) {
      console.error("Error fetching videos:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError("Failed to fetch videos. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const VideoItem = ({ video }) => {
    const [showVideo, setShowVideo] = useState(false);

    const handleClick = () => {
      setShowVideo(true);
    };

    return (
      <div className={styles["video-item"]}>
        {/* Display title and description above the video */}
        <h3>{video.title}</h3>
        <p>{video.description}</p>

        {!showVideo ? (
          <div onClick={handleClick} style={{ cursor: "pointer" }}>
            <img
              src={video.thumbnail_path}
              alt="Video Thumbnail"
              style={{ width: "100%", borderRadius: "10px" }}
            />
            <p>Click to play</p>
          </div>
        ) : (
          <video controls style={{ width: "100%", borderRadius: "10px" }}>
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles["loading-spinner"]}>Loading videos...</div>;
  }

  return (
    <div className={styles["videos-container"]}>
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

      <div className={styles["upload-container"]}>
        <button
          className={styles["upload-button"]}
          onClick={() => navigate("/video-upload")}
          title="Upload a video"
        >
          <img src={uploadIcon} alt="Upload" />
        </button>
      </div>

      {error && <div className={styles["error-message"]}>{error}</div>}

      <h2>Videos</h2>
      <div className={styles["video-list"]}>
        {videos.length > 0 ? (
          videos.map((video, index) => <VideoItem key={index} video={video} />)
        ) : (
          <p>No videos available.</p>
        )}
      </div>
    </div>
  );
};

export default Videos;
