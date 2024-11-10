import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/authSlice";
import OpenRequestsIcon from "../../images/news.png";
import CreateRequestIcon from "../../images/Notes.png";
import VideosIcon from "../../images/navigate_videos.png";
import ApplicationsIcon from "../../images/Apps.png";
import LogoutIcon from "../../images/Logout.png";
import styles from "./Header.module.css";

const Header = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  const pages = [
    {
      path: "/public-requests",
      icon: OpenRequestsIcon,
      alt: "Open Requests",
      title: "Open Requests",
    },
    {
      path: "/requests",
      icon: CreateRequestIcon,
      alt: "Create Request",
      title: "Create Request",
    },
    {
      path: "/videos",
      icon: VideosIcon,
      alt: "Videos",
      title: "Videos",
    },
    {
      path: "/app-dashboard",
      icon: ApplicationsIcon,
      alt: "Applications",
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
            {pages.map((page) =>
              location.pathname !== page.path ? (
                <div
                  key={page.path}
                  className={styles.icon}
                  onClick={() => handleNavigation(page.path)}
                >
                  <img
                    className={styles.iconImage}
                    src={page.icon}
                    alt={page.alt}
                    title={page.title}
                  />
                </div>
              ) : null
            )}
            {isAuthenticated && (
              <div className={styles.icon} onClick={handleLogout}>
                <img
                  className={styles.iconImage}
                  src={LogoutIcon}
                  alt="Logout"
                  title="Logout"
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
