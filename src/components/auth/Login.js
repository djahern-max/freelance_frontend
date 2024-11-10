import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Login.css";
import api from "../../utils/api";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  useEffect(() => {
    console.log("API URL:", process.env.REACT_APP_API_URL);
    console.log("Current Route:", location.pathname);
  }, [location.pathname]);

  // Helper function to check if the token has expired
  const isTokenExpired = (token) => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT token payload
      const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
      return decodedToken.exp < currentTime; // Check if token expiration is less than current time
    } catch (e) {
      console.error("Token decoding error:", e);
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { data } = await api.post("/auth/login", {
        username,
        password,
      });

      const { access_token } = data;

      // Get user info after successful login
      const { data: userData } = await api.get("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!isTokenExpired(access_token)) {
        dispatch(
          login({
            token: access_token,
            username: userData.username,
            userId: userData.id.toString(),
          })
        );
        navigate(from, { replace: true });
      } else {
        throw new Error("Token is invalid or expired.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.detail || error.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <p className="error-message">{error}</p>}
        <div className="register-link">
          <p>
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
