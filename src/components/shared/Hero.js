import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./Hero.css";
import simpleSun from "../../images/simple_sun.png";

const Hero = () => {
  const [headerText, setHeaderText] = useState("Automate Your Life with AI");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Initialize useNavigate for navigation

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
        {/* Use the static headerText */}
        <h1>{headerText}</h1>

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
