import {
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquareMore,
  Search,
  UserCircle,
  UsersRound,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import FeedbackModal from '../feedback/FeedbackModal';
import SharedRequestNotification from '../requests/SharedRequestNotification';
import styles from './Header.module.css';
import HeaderMenu from './HeaderMenu';

const Header = () => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.userType);
  const navigate = useNavigate();
  const location = useLocation();

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
        path: '/creators',
        icon: UsersRound,
        title: 'Creators',
        requiresAuth: false,
      },
      {
        path: '/videos',
        icon: Video,
        title: 'Videos',
        requiresAuth: false,
      },
    ];

    return pages;
  };

  const handleNavigation = (path) => {
    const page = getPages().find((p) => p.path === path);
    if (page?.requiresAuth && !isAuthenticated) {
      navigate('/login', { state: { from: path } });
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  // Filter out the current page from navigation items
  const navigationItems = getPages().filter((page) => {
    // Get the base path without query parameters
    const currentPath = location.pathname.split('?')[0];

    // Check if the page should be shown based on auth requirements and current path
    return (
      (!page.requiresAuth || (page.requiresAuth && isAuthenticated)) &&
      page.path !== currentPath &&
      // Also hide if current path is /requests and page is dashboard for clients
      !(
        userType === 'client' &&
        currentPath === '/requests' &&
        page.path === '/client-dashboard'
      ) &&
      // Hide dashboard icon when on either dashboard
      !(
        page.path === getDashboardPath() &&
        (currentPath === '/client-dashboard' ||
          currentPath === '/developer-dashboard' ||
          currentPath === '/requests')
      )
    );
  });

  // Menu items for the dropdown menu
  const menuItems = [
    {
      icon: MessageSquareMore,
      title: 'Feedback',
      onClick: () => setShowFeedbackModal(true),
    },
    {
      icon: HelpCircle,
      title: 'Support',
      onClick: () => navigate('/support'),
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
        </div>
      </div>

      {showFeedbackModal && (
        <FeedbackModal
          location="header"
          targetId="general_feedback"
          onClose={() => setShowFeedbackModal(false)}
        />
      )}
    </header>
  );
};

export default Header;
