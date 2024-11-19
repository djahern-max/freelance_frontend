import { LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './ProfileHeader.module.css';

const ProfileHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const userType = useSelector((state) => state.auth.userType);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const getProfilePath = () => {
    return userType === 'developer' ? '/developer-profile' : '/client-profile';
  };

  return (
    <div className={styles.container}>
      <button onClick={toggleMenu} className={styles.profileButton}>
        <div className={styles.avatarCircle}>
          <User className={styles.userIcon} size={20} />
        </div>
      </button>

      {isMenuOpen && (
        <div className={styles.dropdown}>
          <Link to={getProfilePath()} className={styles.dropdownItem}>
            <User className={styles.menuIcon} size={16} />
            Profile
          </Link>
          \\
          <button
            onClick={() => {
              // Add logout logic here
            }}
            className={styles.dropdownItem}
          >
            <LogOut className={styles.menuIcon} size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
