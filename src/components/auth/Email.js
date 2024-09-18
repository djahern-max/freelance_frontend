import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Email = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/NewsletterDashboard";

  useEffect(() => {
    console.log("API URL:", process.env.REACT_APP_API_URL); // Log API URL for debugging
    console.log("Current Route:", location.pathname); // Log the current route
  }, [location.pathname]);

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
          body: JSON.stringify({
            email: email, // Use the correct 'email' variable
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error subscribing");
      }

      const data = await response.json();

      // Redirect to NewsletterDashboard upon successful subscription or if already subscribed
      navigate(from, { replace: true });
    } catch (error) {
      setError("Please Try Again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Enter Email</h2>
        <input
          type="email" // Use 'email' type for validation
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
        {error && <p className="error-message">{error}</p>}
        <div className="register-link"></div>
      </form>
    </div>
  );
};

export default Email;
