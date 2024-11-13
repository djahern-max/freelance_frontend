import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login, loginStart, loginFailure } from "../../redux/authSlice";
import { clearAuthData } from "../../utils/authCleanup";
import api from "../../utils/api"; // Use your API client instead of axios directly
import styles from "./Login.module.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear any existing auth data on mount
  useEffect(() => {
    clearAuthData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    dispatch(loginStart());

    try {
      // Step 1: Login and get token
      const loginResponse = await api.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      });

      const token = loginResponse.data.access_token;
      if (!token) {
        throw new Error("No token received from server");
      }

      // Store token immediately
      localStorage.setItem("token", token);

      // Update API client headers
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Step 2: Get user info
      const userResponse = await api.get("/auth/me");
      const userData = userResponse.data;

      console.log("User data received:", userData);

      // Dispatch login success with complete user data
      dispatch(
        login({
          token,
          user: userData,
        })
      );

      // Determine redirect path
      const redirectTo =
        location.state?.from ||
        (userData.user_type === "client"
          ? "/client-dashboard"
          : "/developer-dashboard");

      // Navigate to appropriate dashboard
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error("Login error:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });

      // Clear any partial auth data
      clearAuthData();

      // Handle specific error cases
      if (err.response?.status === 401) {
        setError("Invalid username or password");
      } else if (err.response?.status === 422) {
        setError("Please check your input and try again");
      } else if (!err.response) {
        setError("Unable to connect to server. Please try again later.");
      } else {
        setError(
          err.response?.data?.detail || "An error occurred during login"
        );
      }

      dispatch(loginFailure(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(), // Trim whitespace
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button
              className={styles.dismissError}
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingText}>Signing in...</span>
            ) : (
              "Sign In"
            )}
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
