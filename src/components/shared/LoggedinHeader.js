import React from "react";
import { useSelector, useDispatch } from "react-redux"; // Added useDispatch
import { useNavigate } from "react-router-dom";
import "./Header.css";
import News from "../../images/news.png";

import Notes from "../../images/Notes.png";
import Apps from "../../images/Apps.png";
import simpleSun from "../../images/simple_sun.png";
import Logout from "../../images/Logout.png"; // Make sure this matches the JSX usage
import { logout } from "../../redux/authSlice";

const LoggedInHeader = () => {
  // Changed to "LoggedInHeader" for clarity
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const dispatch = useDispatch(); // Added useDispatch
  const navigate = useNavigate();

  // Handle logout logic
  const handleLogout = () => {
    // Dispatch logout action to clear user data
    dispatch(logout());
    // Redirect to login page
    navigate("/login");
  };

  const handleNewsClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/email", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  const handleProtectedClick = (e, path) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login", { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  return (
    <header className="header">
      <div className="logo">RYZE.ai</div>
      <div className="logo-image">
        <img src={simpleSun} alt="Simple Sun Logo" />
      </div>
      <nav className="nav">
        {/* News icon: requires email if not authenticated */}
        <div
          className="icon"
          onClick={(e) => handleNewsClick(e, "/newsletter-dashboard")}
        >
          <img src={News} alt="News" />
        </div>
        {/* <div
          className="icon"
          onClick={(e) => handleProtectedClick(e, "/tutorials-dashboard")}
        >
          <img src={School} alt="Tutorials" />
        </div> */}

        <div
          className="icon"
          onClick={(e) => handleProtectedClick(e, "/notes")}
        >
          <img src={Notes} alt="Notes" />
        </div>

        <div
          className="icon"
          onClick={(e) => handleProtectedClick(e, "/apps-dashboard")}
        >
          <img src={Apps} alt="Projects" />
        </div>

        {isAuthenticated && (
          <div className="icon logout-icon" onClick={handleLogout}>
            <img src={Logout} alt="Logout" />
          </div>
        )}
      </nav>
    </header>
  );
};

export default LoggedInHeader;
