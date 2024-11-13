import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthData } from "../../utils/authCleanup";
import styles from "./Logout.module.css"; // Add this if you want to style the button

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Use clearAuthData which internally dispatches logout action
    clearAuthData();
    navigate("/");
  };

  return (
    <button
      onClick={handleLogout}
      className={styles.logoutButton} // Add styling if needed
    >
      Logout
    </button>
  );
};

export default Logout;
