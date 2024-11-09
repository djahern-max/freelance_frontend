import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import OpenRequestsIcon from "../../images/news.png"; // Assuming this is the "Open Requests" icon
import CreateRequestIcon from "../../images/Notes.png";
import VideosIcon from "../../images/navigate_videos.png";
import ApplicationsIcon from "../../images/Apps.png";
import LogoutIcon from "../../images/Logout.png";
import "./Header.css";

const Header = () => {
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
    { path: "/videos", icon: VideosIcon, alt: "Videos", title: "Videos" },
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
      // Clear any authentication tokens or user data here if necessary
      navigate("/login"); // Redirect to login after logout
    }
  };

  return (
    <header className="header">
      <div className="icon-bar">
        {location.pathname === "/" ? (
          <h1 className="header-title">RYZE.ai</h1>
        ) : (
          <>
            {pages.map((page) =>
              location.pathname !== page.path ? (
                <div
                  key={page.path}
                  className="icon"
                  onClick={() => handleNavigation(page.path)}
                >
                  <img src={page.icon} alt={page.alt} title={page.title} />
                </div>
              ) : null
            )}
            {isAuthenticated && (
              <div className="icon" onClick={handleLogout}>
                <img src={LogoutIcon} alt="Logout" title="Logout" />
              </div>
            )}
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
