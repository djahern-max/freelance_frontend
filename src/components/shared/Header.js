import {
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  UsersRound,
  Video,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import SharedRequestNotification from '../requests/SharedRequestNotification';
import styles from './Header.module.css';

const Header = () => {
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
      {
        path: '/settings',
        icon: Settings,
        title: 'Settings',
        requiresAuth: true,
      },
    ];

    return pages;
  };

  const handleNavigation = (path) => {
    // Find the page configuration
    const page = getPages().find((p) => p.path === path);

    // Only check authentication for pages that require it
    if (page.requiresAuth && !isAuthenticated) {
      navigate('/login', { state: { from: path } });
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' }); // Replace with the actual action for logout if different
    navigate('/login'); // Redirect the user to the login page after logout
  };

  // Filter out the current page from navigation items
  const navigationItems = getPages().filter((page) => {
    // Get the base path without query parameters
    const currentPath = location.pathname.split('?')[0];

    // Check if the page should be shown based on auth requirements and current path
    return (
      (!page.authRequired || (page.authRequired && isAuthenticated)) &&
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

  return (
    <header className={styles.header}>
      <div className={styles.iconBar}>
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
        {isAuthenticated && userType === 'developer' && (
          <div className={styles.notificationContainer}>
            <SharedRequestNotification />
          </div>
        )}
        {isAuthenticated && (
          <div className={styles.icon} onClick={handleLogout} title="Logout">
            <LogOut className={styles.iconImage} size={24} strokeWidth={1.5} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
