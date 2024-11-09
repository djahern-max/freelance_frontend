import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./Videos.module.css";
import uploadIcon from "../../images/upload.png";
import { useNavigate } from "react-router-dom";
import Header from "../shared/Header";

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
      <Header />

      <div className={styles["upload-container"]}>
        <button
          className={styles["upload-button"]}
          onClick={() => navigate("/video-upload")}
          title="Upload a video"
        >
          <img src={uploadIcon} alt="Upload" />
          <span>Upload a Video</span>
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
