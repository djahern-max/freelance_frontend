import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the shared dashboard CSS

const PodcastsDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear the authentication state
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Podcasts Dashboard</h1>
      <p>This is the placeholder for the podcasts dashboard.</p>

      {/* Links to other dashboards */}
      <div className="button-container">
        <Link to="/collaboration-dashboard" className="dashboard-link">
          Go to Collaboration
        </Link>
        <Link to="/tutorials-dashboard" className="dashboard-link">
          Go to Tutorials
        </Link>
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

export default PodcastsDashboard;
