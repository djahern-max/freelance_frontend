import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const Email = () => {
  const [email, setEmail] = useState(""); // Fix email typo
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

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
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      // Redirect to the page the user was trying to access before login
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
          type="text"
          placeholder="Email"
          value={email} // Change 'username' to 'email'
          onChange={(e) => setEmail(e.target.value)} // Update the email state correctly
        />
        <button type="submit">Submit</button>
        {error && <p className="error-message">{error}</p>}
        <div className="register-link"></div>
      </form>
    </div>
  );
};

export default Email;
