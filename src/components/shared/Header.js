import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MessageSquareMore,
  Search,
  UserCircle,
  UsersRound,
  ShoppingCart,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();

  const handleLoginClick = () => {
    setShowAuthDialog(true);
  };

  const handleAuthDialogClose = () => {
    setShowAuthDialog(false);
  };

  const handleLoginRedirect = () => {
    setShowAuthDialog(false);
    navigate('/login');
  };

  const handleRegisterRedirect = () => {
    setShowAuthDialog(false);
    navigate('/register');
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  const getDashboardPath = () => {
    return userType === 'client' ? '/client-dashboard' : '/developer-dashboard';
  };

  const getPages = () => {
    const pages = [
      {
        path: getDashboardPath(),
        icon: LayoutDashboard,
        title: 'Dashboard',
        requiresAuth: true,
      },
      {
        path: '/opportunities',
        icon: Search,
        title: 'Opportunities',
        requiresAuth: false,
      },
      {
        path: '/videos',
        icon: Video,
        title: 'Videos',
        requiresAuth: false,
      },
      {
        path: '/creators',
        icon: UsersRound,
        title: 'Creators',
        requiresAuth: false,
      },
      // Add the marketplace page
      {
        path: () => userType === 'developer' ? '/marketplace/upload' : '/marketplace',
        icon: ShoppingCart,  // Just like your other Lucide icons
        title: 'Marketplace',
        requiresAuth: false,
      }
    ];

    return pages;
  };

  // Update the handleNavigation function to handle function paths
  const handleNavigation = (path) => {
    const page = getPages().find((p) => p.path === path || (typeof path === 'function' && p.path === path));
    if (page?.requiresAuth && !isAuthenticated) {
      navigate('/login', { state: { from: typeof path === 'function' ? path() : path } });
      return;
    }
    navigate(typeof path === 'function' ? path() : path);
  };

  const navigationItems = getPages().filter((page) => {
    const currentPath = location.pathname.split('?')[0];
    return (
      (!page.requiresAuth || (page.requiresAuth && isAuthenticated)) &&
      page.path !== currentPath &&
      !(
        userType === 'client' &&
        currentPath === '/requests' &&
        page.path === '/client-dashboard'
      ) &&
      !(
        page.path === getDashboardPath() &&
        (currentPath === '/client-dashboard' ||
          currentPath === '/developer-dashboard' ||
          currentPath === '/requests')
      )
    );
  });

  const menuItems = [
    {
      icon: MessageSquareMore,
      title: 'Feedback',
      onClick: () => setShowFeedbackModal(true),
    },
    ...(isAuthenticated
      ? [
        {
          icon: UserCircle,
          title: 'Profile',
          onClick: () => navigate('/profile'),
        },
        {
          icon: LogOut,
          title: 'Logout',
          onClick: handleLogout,
        },
      ]
      : []),
  ];

  return (
    <header className={styles.header}>
      <div className={styles.iconBar}>
        <div className={styles.leftSection}>
          {navigationItems.map((page) => (
            <div
              key={page.path}
              className={styles.icon}
              onClick={() => handleNavigation(page.path)}
              title={page.title}
            >
              <page.icon
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
            <button className={styles.signInButton} onClick={handleLoginClick}>
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
        onClose={handleAuthDialogClose}
        onLogin={handleLoginRedirect}
        onRegister={handleRegisterRedirect}
      />
    </header>
  );
};

export default Header;
