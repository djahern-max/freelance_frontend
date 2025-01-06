import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareMore,
  Search,
  UserCircle,
  UsersRound,
  CheckCircle,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AuthDialog from '../auth/AuthDialog';
import FeedbackModal from '../feedback/FeedbackModal';
import SharedRequestNotification from '../requests/SharedRequestNotification';
import styles from './Header.module.css';
import HeaderMenu from './HeaderMenu';

const Header = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.userType);
  const navigate = useNavigate();

  // Define navigation items
  const navigationItems = [
    {
      path: '/opportunities',
      icon: Search,
      title: 'Opportunities'
    },
    {
      path: '/showcase',
      icon: CheckCircle,
      title: 'Solutions'
    },
    {
      path: '/creators',
      icon: UsersRound,
      title: 'Creators'
    },
    {
      path: '/videos',
      icon: Video,
      title: 'Videos'
    }
  ];

  // Only add Dashboard if user is authenticated
  if (isAuthenticated) {
    navigationItems.unshift({
      path: userType === 'client' ? '/client-dashboard' : '/developer-dashboard',
      icon: LayoutDashboard,
      title: 'Dashboard'
    });
  }

  const menuItems = [
    {
      icon: MessageSquareMore,
      title: 'Feedback',
      onClick: () => setShowFeedbackModal(true)
    },
    ...(isAuthenticated
      ? [
        {
          icon: UserCircle,
          title: 'Profile',
          onClick: () => navigate('/profile')
        },
        {
          icon: LogOut,
          title: 'Logout',
          onClick: () => {
            dispatch({ type: 'LOGOUT' });
            navigate('/login');
          }
        }
      ]
      : [])
  ];

  return (
    <header className={styles.header}>
      <div className={styles.iconBar}>
        <div className={styles.leftSection}>
          {navigationItems.map((item) => (
            <div
              key={item.path}
              className={styles.icon}
              onClick={() => navigate(item.path)}
              title={item.title}
            >
              <item.icon
                className={styles.iconImage}
                size={24}
                strokeWidth={1.5}
              />
            </div>
          ))}
        </div>

        <div className={styles.rightSection}>
          {isAuthenticated && userType === 'developer' && (
            <div className={styles.notificationContainer}>
              <SharedRequestNotification />
            </div>
          )}

          <div className={styles.menuContainer}>
            <HeaderMenu>
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className={styles.menuItem}
                  onClick={item.onClick}
                >
                  <item.icon size={20} />
                  <span>{item.title}</span>
                </button>
              ))}
            </HeaderMenu>
          </div>

          {!isAuthenticated && (
            <button
              className={styles.signInButton}
              onClick={() => setShowAuthDialog(true)}
            >
              <LogIn size={20} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          location="header"
          targetId="general_feedback"
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onLogin={() => {
          setShowAuthDialog(false);
          navigate('/login');
        }}
        onRegister={() => {
          setShowAuthDialog(false);
          navigate('/register');
        }}
      />
    </header>
  );
};

export default Header;