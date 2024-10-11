import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Features.css";
import News from "../../images/news.png";
import School from "../../images/school.png";
import Notes from "../../images/Notes.png";
import Apps from "../../images/Apps.png";

const Features = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const handleNewsClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/email", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  const handleProtectedClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      // Navigate to the login page instead of the email page
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <section className="features" id="features">
      <div className="feature-cards">
        {/* Handle Newsletter access by email */}
        <div
          className="card"
          onClick={(e) => handleNewsClick(e, "/newsletter-dashboard")}
        >
          <img src={News} alt="News" />
          <h3>News</h3>
        </div>

        {/* Handle protected sections */}
        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/tutorials-dashboard")}
        >
          <img src={School} alt="Tutorials" />
          <h3>Tutorials</h3>
        </div>

        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/notes-dashboard")}
        >
          <img src={Notes} alt="Notes" />
          <h3>Notes</h3>
        </div>
        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/app-dashboard")}
        >
          <img src={Apps} alt="Projects" />
          <h3>Projects</h3>
        </div>
      </div>
    </section>
  );
};

export default Features;
