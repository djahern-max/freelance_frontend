import React from "react";
import "./Header.css"; // Optional if specific styles are needed
import simpleSun from "../../images/simple_sun.png";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">RYZE.ai</div>
      <div className="logo-image">
        <img src={simpleSun} alt="Simple Sun Logo" />
      </div>
      <nav className="nav">
        {/* <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>
        <a href="#contact">Contact</a> */}
        {/* <a href="#signup" className="cta">
          Sign Up
        </a> */}
      </nav>
    </header>
  );
};

export default Header;
