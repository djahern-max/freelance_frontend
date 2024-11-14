import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/authSlice";
import {
  FileText,
  PlusSquare,
  Video,
  Grid,
  LogOut,
  Search,
  Home,
  Layout,
  FolderPlus,
} from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const userType = useSelector((state) => state.auth.user?.userType);
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation items based on user type
  const getNavigationItems = () => {
    // If not authenticated, show only home
    if (!isAuthenticated) {
      return [
        {
          path: "/",
          icon: Home,
          title: "Home",
        },
      ];
    }

    // Client navigation items
    if (userType === "client") {
      return [
        {
          path: "/client-dashboard",
          icon: Layout,
          title: "Dashboard",
        },
        {
          path: "/create-project",
          icon: FolderPlus,
          title: "Create Project",
        },
        {
          path: "/requests",
          icon: FileText,
          title: "Create Request",
        },
      ];
    }

    // Developer navigation items
    return [
      {
        path: "/developer-dashboard",
        icon: Layout,
        title: "Dashboard",
      },
      {
        path: "/public-requests",
        icon: Search,
        title: "Available Requests",
      },
      {
        path: "/app-dashboard",
        icon: Grid,
        title: "App Showcase",
      },
      {
        path: "/videos",
        icon: Video,
        title: "Videos",
      },
    ];
  };

  const pages = getNavigationItems();

  const handleNavigation = (path) => {
    // Remove the condition that was forcing navigation to login
    // for authenticated users
    navigate(path);
  };

  const handleLogout = () => {
    if (isAuthenticated) {
      dispatch(logout());
      navigate("/login");
    }
  };

  // Debug logging
  console.log("Current user type:", userType);
  console.log("Current navigation items:", pages);
  console.log("Is authenticated:", isAuthenticated);

  return (
    <header className={styles.header}>
      <div className={styles.iconBar}>
        {location.pathname === "/" ? (
          <h1 className={styles.headerTitle}>RYZE.ai</h1>
        ) : (
          <>
            {pages.map((page) => (
              <div
                key={page.path}
                className={`${styles.icon} ${
                  location.pathname === page.path ? styles.active : ""
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
            ))}
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
