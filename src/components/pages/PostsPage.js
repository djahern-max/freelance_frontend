import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css"; // Import CSS module

const PostsPage = () => {
  const navigate = useNavigate();

  // Function to navigate back to the home page
  const handleGoHome = () => {
    navigate("/"); // Navigate to the home page
  };

  return (
    <div className={styles.dashboardContainer}>
      <h1 className={styles.heading}>Welcome to RYZE.ai!</h1>
      <p className={styles.description}>
        This site is under construction but stay tuned, it is going to be
        awesome!
      </p>

      {/* "Back to Home" Button */}
      <button onClick={handleGoHome} className={styles.logoutButton}>
        Back to Home
      </button>
    </div>
  );
};

export default PostsPage;
