import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import Posts from "./Posts";

const CollaborationDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear the authentication state
    navigate("/"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <Posts />
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
