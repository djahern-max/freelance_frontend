import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css"; // Import CSS module

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the JWT token from localStorage
    localStorage.removeItem("token");
    // Redirect to the login page
    navigate("/login");
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.heading}>Welcome to the Ryze.ai!</h1>
      <p className={styles.description}>
        This site is under construction but stay tuned, it is going to be
        awesome!
      </p>
      {/* Logout Button */}
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;
