import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserType } from '../../redux/authSlice';
import ClientProfile from '../profiles/ClientProfile';
import DeveloperProfile from '../profiles/DeveloperProfile';
import styles from './Settings.module.css';

const Settings = () => {
  const userType = useSelector(selectUserType);
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className={styles.container}>
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${
              activeTab === 'profile' ? styles.activeTab : ''
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          {/* Additional tabs can be added here */}
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'profile' && (
          <>
            {userType === 'developer' ? (
              <DeveloperProfile />
            ) : userType === 'client' ? (
              <ClientProfile />
            ) : (
              <div className={styles.error}>
                Please select a user type to set up your profile
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
