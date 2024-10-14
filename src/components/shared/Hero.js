import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Hero.css";
import simpleSun from "../../images/simple_sun.png";

const Hero = () => {
  const [headerText, setHeaderText] = useState("United we Create");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate for navigation

  // Function to update the header text based on screen width
  const updateHeaderText = () => {
    if (window.innerWidth < 745) {
      setHeaderText("United we Create");
    } else {
      setHeaderText("United we Create");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to subscribe. Please try again.");
      }

      const data = await response.json();
      setSuccess("Successfully subscribed to the newsletter!");
      setEmail(""); // Clear the email input after success

      // Navigate to NewsletterDashboard after successful subscription
      navigate("/newsletter-dashboard", { state: { email } });
    } catch (error) {
      setError("Subscription failed. Please try again.");
    }
  };

  return (
    <section className="hero">
      <div className="hero-text">
        {/* Dynamically change the h1 text */}
        <h1>{headerText}</h1>
        <p>Devided we Debug</p>

        {/* Form for email subscription */}
        <form className="email-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Subscribe</button>
        </form>

        {/* Show success or error message */}
        {success && <p className="success-message">{success}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
      <div className="hero-image">
        <img src={simpleSun} alt="AI Sun" />
      </div>
    </section>
  );
};

export default Hero;
