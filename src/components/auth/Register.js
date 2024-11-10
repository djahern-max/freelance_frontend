import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  useEffect(() => {
    console.log("API URL:", process.env.REACT_APP_API_URL);
    console.log("Return path:", from); // Log the return path for debugging
  }, [from]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const apiUrl = `${process.env.REACT_APP_API_URL}/auth/register`;
    console.log("Using API route:", apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          full_name: fullName,
          password,
        }),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers));

      const responseData = await response.text();
      console.log("Raw response body:", responseData);

      let jsonData;
      try {
        jsonData = JSON.parse(responseData);
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError);
      }

      if (!response.ok) {
        const errorMessage =
          jsonData?.detail || "Registration failed. Please try again.";
        setError(errorMessage);
        return;
      }

      console.log("Registration successful, navigating to login");
      // Pass the return path to the login page
      navigate("/login", {
        state: {
          from: from,
          registrationSuccess: true, // Optional: Add this if you want to show a success message on login
        },
      });
    } catch (err) {
      console.error("Registration request failed:", err);
      setError("An error occurred during registration. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleRegister}>
        <h2>Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Register</button>
        {error && <p className="error-message">{error}</p>}
        <div className="register-link">
          <p>
            Already have an account?{" "}
            <Link to="/login" state={{ from: from }}>
              Login
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;
