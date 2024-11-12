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
} from "lucide-react";
import styles from "./Header.module.css";

const Header = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    {
      path: "/public-requests",
      icon: Search,
      title: "Open Requests",
    },
    {
      path: "/requests",
      icon: FileText,
      title: "Create Request",
    },
    {
      path: "/videos",
      icon: Video,
      title: "Videos",
    },
    {
      path: "/app-dashboard",
      icon: Grid,
      title: "Applications",
    },
  ];

  const handleNavigation = (path) => {
    if (!isAuthenticated && path !== "/public-requests") {
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  const handleLogout = () => {
    if (isAuthenticated) {
      dispatch(logout());
      navigate("/login");
    }
  };

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
