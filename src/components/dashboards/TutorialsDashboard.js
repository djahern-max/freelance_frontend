import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the shared dashboard CSS

const TutorialsDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear the authentication state
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Tutorials Dashboard</h1>
      <p>This is the placeholder for the tutorials dashboard.</p>

      {/* Links to other dashboards */}
      <div className="button-container">
        <a href="/collaboration-dashboard" className="dashboard-link">
          Go to Collaboration
        </a>
        <a href="/podcasts-dashboard" className="dashboard-link">
          Go to Podcasts
        </a>
      </div>

      {/* Logout button below */}
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default TutorialsDashboard;
