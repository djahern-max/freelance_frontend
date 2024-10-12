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
  const [userVideos, setUserVideos] = useState([]);
  const [otherVideos, setOtherVideos] = useState([]);
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

      const response = await axios.get(`${apiUrl}/video_display/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserVideos(response.data.user_videos);
      setOtherVideos(response.data.other_videos);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError("Failed to fetch videos. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("Token not found. Please log in again.");
      return;
    }
    fetchVideos();
  }, []);

  const VideoItem = ({ video }) => {
    const videoUrl = `${apiUrl}/video_display/stream/${video.id}`;
    return (
      <div className={styles["video-item"]}>
        <h3>{video.title}</h3>
        <p>{video.description}</p>
        <video controls>
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
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
          onClick={() => navigate("/notes-dashboard")}
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
          onClick={() => console.log("Upload video")}
          title="Upload a video"
        >
          <img src={uploadIcon} alt="Upload" />
        </button>
      </div>

      <h1>Videos</h1>
      {error && <div className={styles["error-message"]}>{error}</div>}

      <h2>My Videos</h2>
      <div className={styles["video-list"]}>
        {userVideos.length > 0 ? (
          userVideos.map((video) => <VideoItem key={video.id} video={video} />)
        ) : (
          <p>No videos uploaded by you yet.</p>
        )}
      </div>

      <h2>Other Videos</h2>
      <div className={styles["video-list"]}>
        {otherVideos.length > 0 ? (
          otherVideos.map((video) => <VideoItem key={video.id} video={video} />)
        ) : (
          <p>No other videos available yet.</p>
        )}
      </div>
    </div>
  );
};

export default Videos;
