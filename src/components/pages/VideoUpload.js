import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styles from "./VideoUpload.module.css";
import uploadIcon from "../../images/upload.png";
import newsIcon from "../../images/news.png";
import notesIcon from "../../images/Notes.png";
import appsIcon from "../../images/Apps.png";
import logoutIcon from "../../images/Logout.png";
import navigateIcon from "../../images/navigate_videos.png";

const Videos = () => {
  const [userVideos, setUserVideos] = useState([]);
  const [otherVideos, setOtherVideos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isProject, setIsProject] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;
  const isProduction = process.env.REACT_APP_ENV === "production";

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

      setUserVideos(
        Array.isArray(response.data.user_videos)
          ? response.data.user_videos
          : []
      );
      setOtherVideos(
        Array.isArray(response.data.other_videos)
          ? response.data.other_videos
          : []
      );
    } catch (err) {
      console.error("Error fetching videos:", err);
      if (err.response && err.response.status === 401) {
        setError("Unauthorized. Please log in again.");
      } else {
        setError("Failed to fetch videos. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login");
  };

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
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found, please log in again.");
      }

      const response = await axios.post(`${apiUrl}/videos/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Upload successful:", response.data);
      setUploadStatus("success");
      fetchVideos(); // Refresh the video list
      setShowUploadForm(false); // Hide the upload form
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadStatus("error");
    }
  };

  const VideoItem = ({ video }) => {
    const videoUrl = isProduction
      ? video.file_path
      : `${apiUrl}${video.file_path}`;

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
          onClick={() => setShowUploadForm(!showUploadForm)}
          title="Upload a video"
        >
          <img src={uploadIcon} alt="Upload" />
        </button>
      </div>

      {showUploadForm && (
        <div className={styles.videoUploadContainer}>
          <form className={styles.videoUploadForm} onSubmit={handleSubmit}>
            <div className={styles.formHeader}>
              <h2>Upload Video</h2>
              <button
                className={styles.navigateIconButton}
                onClick={() => setShowUploadForm(false)}
                type="button"
              >
                <img
                  src={navigateIcon}
                  alt="Close Upload Form"
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
      )}

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
