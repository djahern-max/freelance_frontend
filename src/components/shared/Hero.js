import React, { useState, useEffect } from "react";
import "./Hero.css";
import simpleSun from "../../images/simple_sun.png";

const Hero = () => {
  const [headerText, setHeaderText] = useState("The Future is Now");

  // Function to update the header text based on screen width
  const updateHeaderText = () => {
    if (window.innerWidth < 745) {
      setHeaderText("RYZE.ai");
    } else {
      setHeaderText("The Future is Now");
    }
  };

  // Run the updateHeaderText function on load and when resizing the window
  useEffect(() => {
    updateHeaderText();
    window.addEventListener("resize", updateHeaderText);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateHeaderText);
    };
  }, []);

  return (
    <section className="hero">
      <div className="hero-text">
        {/* Dynamically change the h1 text */}
        <h1>{headerText}</h1>
        <p>Subscribe to get our daily AI Newsletter</p>

        {/* Form for email subscription */}
        <form className="email-form" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" required />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <div className="hero-image">
        <img src={simpleSun} alt="AI Sun" />
      </div>
    </section>
  );
};

export default Hero;
