import React, { useEffect } from "react";
import styles from "./AuthDialog.module.css";
import { X } from "lucide-react";

// Import your API configuration or environment variables
import { API_BASE_URL } from "../../utils/constants"; // Ensure this file exists

const AuthDialog = ({ isOpen, onClose, error, onLogin, onRegister }) => {
  // Construct the Google OAuth URL dynamically
  const googleLoginUrl = `${API_BASE_URL}/api/login/google`;

  // Console log the URL and API_BASE_URL to debug
  useEffect(() => {
    console.log("API_BASE_URL:", API_BASE_URL);
    console.log("Generated Google OAuth URL:", googleLoginUrl);
  }, [googleLoginUrl]);

  if (!isOpen) return null;

  // Log when button is clicked
  const handleGoogleClick = (e) => {
    console.log("Google login button clicked");
    console.log("Navigating to:", googleLoginUrl);
    // We don't prevent default because we want the navigation to happen
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* Header Section */}
        <div className={styles.header}>
          <h2 className={styles.title}>Welcome to RYZE.ai!</h2>
          <p className={styles.description}>
            Please login or create an account to continue
          </p>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.content}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Google Login Button with dynamic URL and onClick handler for logging */}
          <a
            href={googleLoginUrl}
            className={styles.googleButton}
            onClick={handleGoogleClick}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="Google"
              className={styles.googleIcon}
            />
            Continue with Google
          </a>

          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>

          <button className={styles.primaryButton} onClick={onLogin}>
            Login to Your Account
          </button>

          <div className={styles.divider}>
            <span className={styles.dividerText}>or</span>
          </div>

          <button className={styles.secondaryButton} onClick={onRegister}>
            Create New Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthDialog;