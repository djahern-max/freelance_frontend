import React from "react";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the shared dashboard CSS

const NewsletterDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout()); // Clear the authentication state
    navigate("/login"); // Redirect to login page
  };

  return (
    <div className="dashboard-container">
      <h1>Newsletter Dashboard</h1>
      <p>This is the placeholder for the newsletter dashboard.</p>

      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">
          Exit
        </button>
      </div>
    </div>
  );
};

export default NewsletterDashboard;
