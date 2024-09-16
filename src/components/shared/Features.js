import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./Features.css";
import News from "../../images/news.png";
import School from "../../images/school.png";
import Chat from "../../images/chat.png";
import Podcasts from "../../images/podcast.png";

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="feature-cards">
        {/* Card for Newsletters */}
        <Link to="/newsletter" className="card">
          <img src={News} alt="News" />
          <h3>News</h3>
        </Link>
        {/* Card for Posts */}
        <Link to="/posts" className="card">
          <img src={Chat} alt="Chat" />
          <h3>Collaborate</h3>
        </Link>
        {/* Card for Tutorials */}
        <Link to="/tutorials" className="card">
          <img src={School} alt="School" />
          <h3>Tutorials</h3>
        </Link>
        {/* Card for Posts */}
        <Link to="/posts" className="card">
          <img src={Podcasts} alt="Chat" />
          <h3>Podcasts</h3>
        </Link>
      </div>
    </section>
  );
};

export default Features;
