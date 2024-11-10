import React from "react";
import styles from "./AuthDialog.module.css";
import { X } from "lucide-react";

const AuthDialog = ({ isOpen, onClose, error, onLogin, onRegister }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
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
