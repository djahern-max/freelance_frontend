import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, loginStart, loginFailure } from "../../redux/authSlice";
import { clearAuthData } from "../../utils/authCleanup";
import axios from "axios";
import styles from "./Login.module.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Add useEffect for clearing stale auth data
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Found stale auth data, clearing...");
      clearAuthData();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login attempt starting...");
    dispatch(loginStart());

    try {
      console.log("Making login request...");
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        username: formData.username,
        password: formData.password,
      });

      console.log("Login response received:", loginResponse.data);
      const token = loginResponse.data.access_token;

      if (token) {
        console.log("Token received, getting user info...");
        const userResponse = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("User info received:", userResponse.data);

        dispatch(
          login({
            token,
            user: userResponse.data,
          })
        );

        const userType = userResponse.data.user_type;
        console.log("Navigating to dashboard for user type:", userType);

        if (userType === "client") {
          navigate("/client-dashboard");
        } else if (userType === "developer") {
          navigate("/developer-dashboard");
        } else {
          throw new Error(`Invalid user type: ${userType}`);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      dispatch(loginFailure(err.response?.data?.detail || "Failed to login"));
      setError(err.response?.data?.detail || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Don't have an account?{" "}
            <Link to="/register" className={styles.link}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
