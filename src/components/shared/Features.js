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
      e.preventDefault(); // Prevent the default action if not authenticated
      navigate("/login", { state: { from: path } }); // Pass the path they want to go to
    } else {
      navigate(path); // Navigate to the dashboard directly if authenticated
    }
  };

  return (
    <section className="features" id="features">
      <div className="feature-cards">
        <Link to="/newsletter" className="card">
          <img src={News} alt="News" />
          <h3>News</h3>
        </Link>

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
