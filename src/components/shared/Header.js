import {
  Layers,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Video,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../../redux/authSlice';
import styles from './Header.module.css';

const Header = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.userType);
  const navigate = useNavigate();
  const location = useLocation();

  const getPages = () => {
    const pages = [
      {
        path: '/public-requests',
        icon: Search,
        title: 'Public Requests',
      },
      {
        path: userType === 'client' ? '/requests' : '/developer-dashboard',
        icon: LayoutDashboard,
        title: 'Dashboard',
      },
      {
        path: '/videos',
        icon: Video,
        title: 'Videos',
      },
      {
        path: '/app-dashboard',
        icon: Layers,
        title: 'Applications',
      },
      {
        path: '/settings',
        icon: Settings,
        title: 'Settings',
        authRequired: true,
      },
    ];

    return pages;
  };

  const handleNavigation = (path) => {
    if (!isAuthenticated && path !== '/public-requests') {
      navigate('/login', { state: { from: path } });
      return;
    }
    navigate(path);
  };

  const handleLogout = () => {
    if (isAuthenticated) {
      dispatch(logout());
      navigate('/login');
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.iconBar}>
        {location.pathname === '/' ? (
          <h1 className={styles.headerTitle}>RYZE.ai</h1>
        ) : (
          <>
            {getPages().map(
              (page) =>
                (!page.authRequired ||
                  (page.authRequired && isAuthenticated)) && (
                  <div
                    key={page.path}
                    className={`${styles.icon} ${
                      location.pathname === page.path ? styles.active : ''
                    }`}
                    onClick={() => handleNavigation(page.path)}
                    title={page.title}
                  >
                    <page.icon
                      className={styles.iconImage}
                      size={24}
                      strokeWidth={1.5}
                    />
                  </div>
                )
            )}
            {isAuthenticated && (
              <div
                className={styles.icon}
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut
                  className={styles.iconImage}
                  size={24}
                  strokeWidth={1.5}
                />
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
