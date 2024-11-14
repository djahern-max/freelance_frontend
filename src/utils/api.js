import axios from "axios";
import { clearAuthData } from "./authCleanup";

const getBaseURL = () => {
  // Always use the environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Fallback for production
  if (process.env.NODE_ENV === "production") {
    return "/api";
  }

  // Development fallback
  return "http://localhost:8000";
};

console.log("API Base URL:", getBaseURL()); // Add this for debugging

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("Full Request URL:", `${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Response:", {
        url: response.config.url,
        status: response.status,
        headers: response.headers,
        contentType: response.headers["content-type"],
      });
    }
    return response;
  },
  async (error) => {
    // Log detailed error information
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
      authHeader: error.config?.headers?.Authorization ? "Present" : "Missing",
    };

    console.error("API Error Details:", errorDetails);

    // Handle auth errors
    if (error.response?.status === 401) {
      console.log("Authentication error - token might be invalid or expired");
      clearAuthData();

      // Only redirect if not already on login page
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(
        new Error("Authentication failed - please log in again")
      );
    }

    if (error.response?.status === 403) {
      console.log("Authorization error - insufficient permissions");
      return Promise.reject(
        new Error("You don't have permission to perform this action")
      );
    }

    // Handle CORS errors
    if (error.message.includes("Network Error")) {
      console.error("Possible CORS or network error:", error);
      return Promise.reject(
        new Error("Unable to connect to server. Please check your connection.")
      );
    }

    return Promise.reject(error);
  }
);

// Helper methods
api.helpers = {
  handleError: (error) => {
    console.error("API Error:", error);

    if (error.message.includes("Authentication failed")) {
      return "Your session has expired. Please log in again.";
    }

    if (!error.response) {
      return "Network error: Unable to connect to server";
    }

    switch (error.response.status) {
      case 401:
        return "Please log in to continue";
      case 403:
        return "You don't have permission to perform this action";
      case 404:
        return "The requested resource was not found";
      case 500:
        return "Server error: Please try again later";
      default:
        return error.response?.data?.detail || "An unexpected error occurred";
    }
  },

  // Add method to check auth state
  checkAuthState: () => {
    const token = localStorage.getItem("token");
    if (process.env.NODE_ENV === "development") {
      console.log("Auth State Check:", {
        hasToken: !!token,
        tokenPreview: token ? `${token.substr(0, 10)}...` : null,
      });
    }
    return !!token;
  },
};

export default api;
