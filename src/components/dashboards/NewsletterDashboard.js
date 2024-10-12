import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import schoolIcon from "../../images/navigate_videos.png";
import Notes from "../../images/Notes.png";
import Apps from "../../images/Apps.png";
import logoutIcon from "../../images/Logout.png";
import Coding from "../../images/Coding.webp";
import Energy from "../../images/Efficient_Energy.webp";
import Power from "../../images/nuclear_power.webp";

import "./NewsletterDashboard.css"; // Import specific CSS for the newsletter dashboard

const NewsletterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated); // Replace with your actual auth logic

  const handleLogout = () => {
    dispatch(logout()); // Clear the authentication state
    navigate("/"); // Redirect to login page
  };

  const handleNavigation = (path) => {
    if (isAuthenticated) {
      // If the user is authenticated, navigate to the requested path
      navigate(path);
    } else {
      // If not authenticated, redirect to login and pass the 'from' state
      navigate("/login", { state: { from: path } });
    }
  };

  // Get today's date
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="newsletter-dashboard-wrapper">
        <div className="newsletter-dashboard">
          <div className="newsletter-header">
            <div className="icon-links">
              <img
                src={schoolIcon}
                alt="School"
                className="icon"
                onClick={() => handleNavigation("/tutorials-dashboard")}
              />
              <img
                src={Notes}
                alt="Notes"
                className="icon"
                onClick={() => handleNavigation("/tutorials-dashboard")}
              />

              <img
                src={Apps}
                alt="Projects"
                className="icon"
                onClick={() => handleNavigation("/tutorials-dashboard")}
              />

              <img
                src={logoutIcon}
                alt="Logout"
                className="icon"
                onClick={handleLogout}
              />
            </div>

            <h1>{today}</h1>
          </div>

          <div className="newsletter-content">
            <div className="newsletter-section">
              <h2>Advancements in AI: Unlocking New Frontiers</h2>

              <p>
                Artificial Intelligence continues to push boundaries,
                transforming industries and reshaping how we live and work.
                Recent breakthroughs in AI include the development of{" "}
                <strong>Generative AI</strong> models that can create text,
                images, and even code with unprecedented accuracy. AI’s role in
                healthcare, biotechnology, robotics, and autonomous systems is
                expanding rapidly.
              </p>
            </div>

            <div className="newsletter-section">
              <h2>Coding and AI: The Perfect Partnership</h2>
              <img
                src={Coding}
                alt="Coding and AI"
                className="newsletter-image"
              />
              <p>
                As AI capabilities grow, so does the demand for AI-integrated
                coding solutions. AI tools like <strong>GitHub Copilot</strong>{" "}
                now assist developers by automating coding tasks, offering
                real-time suggestions, and even debugging code. Low-code/no-code
                platforms also benefit from AI, enabling faster development
                without extensive coding knowledge.
              </p>
            </div>

            <div className="newsletter-section">
              <h2>The Energy Demands of AI: A Power-Hungry Future</h2>
              <img
                src={Power}
                alt="Power Demand"
                className="newsletter-image"
              />
              <p>
                While AI is revolutionizing industries, it’s also placing
                significant demands on global energy infrastructure. Training
                large AI models requires immense computational power, which
                draws vast amounts of electricity. This has prompted concerns
                about AI’s environmental impact and led to innovations in{" "}
                <strong>green AI</strong>, focused on reducing energy
                consumption through more efficient algorithms and renewable
                energy.
              </p>
            </div>

            <div className="newsletter-section">
              <h2>AI’s Role in Power Management</h2>
              <img
                src={Energy}
                alt="AI Power Management"
                className="newsletter-image"
              />
              <p>
                Interestingly, AI is now being used to{" "}
                <strong>optimize energy grids</strong> and manage power
                consumption. By predicting energy demand, AI helps distribute
                electricity more efficiently and reduce waste. AI systems in
                smart cities are already improving energy efficiency in
                buildings and transportation, pointing to a more sustainable
                future.
              </p>
            </div>
          </div>

          <div className="newsletter-footer">
            <h3>Stay Tuned for More AI Insights!</h3>
            <p>
              AI and coding are changing the world at an incredible pace, and
              we’re here to keep you updated on the latest trends. From
              breakthroughs in AI research to the growing impact on power
              demand, we’ll continue to bring you cutting-edge updates every
              month.
            </p>
          </div>

          <div className="logout-container">
            <button onClick={handleLogout} className="logout-button">
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsletterDashboard;
