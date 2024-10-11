import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./Header.css";
import News from "../../images/news.png";
import School from "../../images/school.png";
import Notes from "../../images/Notes.png";
import Apps from "../../images/Apps.png";
import simpleSun from "../../images/simple_sun.png";

const Header = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

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

        <div
          className="icon"
          onClick={(e) => handleProtectedClick(e, "/tutorials-dashboard")}
        >
          <img src={School} alt="Tutorials" />
        </div>

        <div
          className="icon"
          onClick={(e) => handleProtectedClick(e, "/notes-dashboard")}
        >
          <img src={Notes} alt="Notes" />
        </div>

        <div
          className="icon"
          onClick={(e) => handleProtectedClick(e, "/apps-dashboard")}
        >
          <img src={Apps} alt="Projects" />
        </div>
      </nav>
    </header>
  );
};

export default Header;
