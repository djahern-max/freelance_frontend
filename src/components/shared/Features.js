import React from "react";
import { Link } from "react-router-dom"; // Import Link from react-router-dom
import "./Features.css";
import News from "../../images/news.png";
import School from "../../images/school.png";
import Chat from "../../images/chat.png";

const Features = () => {
  return (
    <section className="features" id="features">
      <div className="feature-cards">
        {/* Card for Newsletters */}
        <Link to="/newsletter" className="card">
          <img src={News} alt="News" />
          <h3>Read</h3>
          <p>AI Newsletters</p>
        </Link>

        {/* Card for Tutorials */}
        <Link to="/tutorials" className="card">
          <img src={School} alt="School" />
          <h3>Learn</h3>
          <p>Podcasts & Tutorials</p>
        </Link>

        {/* Card for Posts */}
        <Link to="/posts" className="card">
          <img src={Chat} alt="Chat" />
          <h3>Discuss</h3>
          <p>Connect & Discuss</p>
        </Link>
      </div>
    </section>
  );
};

export default Features;
