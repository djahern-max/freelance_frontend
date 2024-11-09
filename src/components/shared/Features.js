import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Features.css";
import PublicRequestsIcon from "../../images/news.png"; // Rename to match the new purpose if necessary
import VideosIcon from "../../images/navigate_videos.png";
import NotesIcon from "../../images/Notes.png";
import ProjectsIcon from "../../images/Apps.png";

const Features = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  // Allow access to Public Requests without authentication
  const handlePublicRequestsClick = () => {
    navigate("/public-requests");
  };

  // Require authentication for other sections
  const handleProtectedClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <section className="features" id="features">
      <div className="feature-cards">
        {/* Public Requests - accessible without authentication */}
        <div className="card" onClick={handlePublicRequestsClick}>
          <img src={PublicRequestsIcon} alt="Public Requests" />
          <h3>Open Requests</h3>
        </div>

        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/requests")}
        >
          <img src={NotesIcon} alt="Notes" />
          <h3>Create Request</h3>
        </div>

        {/* Protected sections - require authentication */}
        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/videos")}
        >
          <img src={VideosIcon} alt="Videos" />
          <h3>Videos</h3>
        </div>

        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/app-dashboard")}
        >
          <img src={ProjectsIcon} alt="Projects" />
          <h3>Applications</h3>
        </div>
      </div>
    </section>
  );
};

export default Features;
