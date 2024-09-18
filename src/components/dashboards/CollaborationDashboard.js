import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the shared dashboard CSS

const CollaborationDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear the authentication state
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Collaboration Dashboard</h1>
      <p>This is the placeholder for the collaboration dashboard.</p>

      {/* Separate div for links */}
      <div className="button-container">
        <Link to="/tutorials-dashboard" className="dashboard-link">
          Go to Tutorials
        </Link>
        <Link to="/podcasts-dashboard" className="dashboard-link">
          Go to Podcasts
        </Link>
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
