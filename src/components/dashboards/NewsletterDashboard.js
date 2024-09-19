import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

import podcastIcon from "../../images/podcast.png"; // Adjust the path accordingly
import schoolIcon from "../../images/school.png";
import chatIcon from "../../images/chat.png";
import logoutIcon from "../../images/Logout.png";

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
            {/* Adding the icons with links */}
            <div className="icon-links">
              <img
                src={podcastIcon}
                alt="Podcast"
                className="icon"
                onClick={() => handleNavigation("/podcasts-dashboard")}
              />
              <img
                src={schoolIcon}
                alt="School"
                className="icon"
                onClick={() => handleNavigation("/tutorials-dashboard")}
              />
              <img
                src={chatIcon}
                alt="Chat"
                className="icon"
                onClick={() => handleNavigation("/collaboration-dashboard")}
              />
              <img
                src={logoutIcon}
                alt="Logout"
                className="icon"
                onClick={handleLogout}
              />
            </div>

            <h1>{today}</h1>
            <p className="headline">Latest in AI News</p>
          </div>

          <div className="newsletter-content">
            <p>
              1. <strong>Apple</strong> is banking on AI to boost sales of its
              new iPhone 16. The company says the new handset has been built
              specifically for artificial intelligence as it looks to regain its
              competitive edge.
            </p>
            <p>
              2. Researchers are exploring how AI can help predict and prepare
              for the next pandemic.
            </p>
            <p>
              3. Discussions about AI-created recipes and how consumers may
              respond continue.
            </p>
            <p>
              4. AI is being used in comedy writing to help comedians generate
              jokes.
            </p>
            <p>
              5. Concerns rise about "AI washing," where companies exaggerate AI
              capabilities.
            </p>
            <p>
              6. The impact of AI on electricity grids is under examination.
            </p>
            <p>
              7. AI is being utilized in insect farming, TV production, and
              addressing labor shortages in Japan.
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
