import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailSignup.css";
import sun from "../../images/sun.png"; // Import the sun image

const EmailSignup = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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

      if (response.ok) {
        // On successful subscription, redirect to the NewsletterDashboard
        navigate("/newsletter-dashboard", { state: { email } });
      } else {
        const data = await response.json();
        setMessage(data.detail || "Something went wrong!");
      }
    } catch (error) {
      setMessage("Failed to subscribe. Please try again later.");
    }
  };

  return (
    <section className="email-signup" id="signup">
      <div className="image-placeholder">
        <img src={sun} alt="Sun" />
      </div>
      <p>Get updates and insights straight to your inbox.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Subscribe</button>
      </form>
      {message && <p>{message}</p>} {/* Display success/error message */}
    </section>
  );
};

export default EmailSignup;
