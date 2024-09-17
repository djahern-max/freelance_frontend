import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the shared dashboard CSS

const CollaborationDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear the authentication state
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Collaboration Dashboard</h1>
      <p>This is the placeholder for the collaboration dashboard.</p>

      {/* Separate div for links */}
      <div className="button-container">
        <a href="/tutorials-dashboard" className="dashboard-link">
          Go to Tutorials
        </a>
        <a href="/podcasts-dashboard" className="dashboard-link">
          Go to Podcasts
        </a>
      </div>

      {/* Separate div for logout button */}
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default CollaborationDashboard;
