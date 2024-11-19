import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileSetupPrompt.module.css';

const ProfileSetupPrompt = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { data: profile } = useSelector((state) => state.profile);

  const [showModal, setShowModal] = useState(!profile); // Show modal if profile doesn't exist

  if (!showModal) return null; // Don't render if the modal is dismissed or profile exists

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.header}>
          <h2 className={styles.title}>Complete Your Profile</h2>
        </div>
        <p className={styles.description}>
          Set up your profile to get the most out of RYZE.ai
        </p>
        <div className={styles.buttons}>
          <button
            className={styles.buttonPrimary}
            onClick={() => navigate(`/profile/${user.userType}`)}
          >
            Set Up Profile
          </button>
          <button
            className={styles.buttonSecondary}
            onClick={() => setShowModal(false)}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPrompt;
