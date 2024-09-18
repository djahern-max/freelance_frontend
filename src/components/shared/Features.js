import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Features.css";
import News from "../../images/news.png";
import School from "../../images/school.png";
import Chat from "../../images/chat.png";
import Podcasts from "../../images/podcast.png";

const Features = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const handleProtectedClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  const handleEmailOnlyClick = (e, path) => {
    const email = prompt("Please enter your email to access the newsletter:");
    if (email) {
      // Navigate to the Newsletter Dashboard
      navigate("/newsletter-dashboard", { state: { email } });
    } else {
      e.preventDefault();
    }
  };

  return (
    <section className="features" id="features">
      <div className="feature-cards">
        {/* Handle Newsletter access by email */}
        <div
          className="card"
          onClick={(e) => handleEmailOnlyClick(e, "/newsletter-dashboard")}
        >
          <img src={News} alt="News" />
          <h3>News</h3>
        </div>

        {/* Handle protected sections */}
        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/collaboration-dashboard")}
        >
          <img src={Chat} alt="Collaborate" />
          <h3>Collaborate</h3>
        </div>

        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/tutorials-dashboard")}
        >
          <img src={School} alt="Tutorials" />
          <h3>Tutorials</h3>
        </div>

        <div
          className="card"
          onClick={(e) => handleProtectedClick(e, "/podcasts-dashboard")}
        >
          <img src={Podcasts} alt="Podcasts" />
          <h3>Podcasts</h3>
        </div>
      </div>
    </section>
  );
};

export default Features;
