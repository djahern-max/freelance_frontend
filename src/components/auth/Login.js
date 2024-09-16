import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Use the environment variable for the API URL
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        // Redirect to dashboard after successful login
        navigate("/dashboard");
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <h2 className={styles.heading}>Login to RYZE.ai</h2>
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.inputField}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.inputField}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.loginButton}>
            Login
          </button>
        </form>
        <p className={styles.registerText}>
          Don’t have an account?{" "}
          <Link to="/register" className={styles.registerLink}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
