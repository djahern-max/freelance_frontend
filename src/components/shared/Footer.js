import React from "react";
import "./Footer.css"; // Import the Footer styles

const Footer = () => {
  return (
    <footer className="footer">
      <p>© 2024 RYZE.ai | All rights reserved.</p>
      <nav className="footer-nav">
        {/* Optional links */}
        {/* <a href="#privacy">Privacy Policy</a>
        <a href="#terms">Terms of Service</a> */}
      </nav>
    </footer>
  );
};

export default Footer;
