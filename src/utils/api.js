import axios from "axios";
import { clearAuthData } from "./authCleanup";

const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    // Use window.location to determine the host dynamically
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}/api`;
  }
  return process.env.REACT_APP_API_URL || "http://localhost:8000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

// Helper function to check if endpoint should return JSON
const isJsonEndpoint = (url) => {
  const jsonPaths = ["requests", "projects", "conversations"];
  return jsonPaths.some((path) => url.includes(path));
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details in development
    if (process.env.NODE_ENV === "development") {
      console.log("API Request:", {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: config.headers,
      });
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Only validate JSON content type for specific endpoints
    if (isJsonEndpoint(response.config.url)) {
      const contentType = response.headers["content-type"] || "";

      // More flexible content type checking
      if (
        !contentType.includes("application/json") &&
        !contentType.includes("text/json")
      ) {
        console.warn(
          `Warning: Unexpected content type for ${response.config.url}: ${contentType}`
        );
        // Log the response for debugging
        console.log("Response data:", response.data);

        // Try to parse if it's actually JSON despite content type
        if (typeof response.data === "object") {
          return response;
        }

        return Promise.reject(
          new Error(`Expected JSON response but received: ${contentType}`)
        );
      }
    }

    return response;
  },
  async (error) => {
    // Enhanced error logging
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      message: error.message,
    };

    console.error("API Error Details:", errorDetails);

    // Handle authentication errors
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log("Authentication error detected");
      clearAuthData();

      // Check current location before redirecting
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(new Error("Authentication failed"));
    }

    // Handle network errors
    if (!error.response) {
      console.error("Network error:", error.message);
      return Promise.reject(
        new Error("Network error: Please check your connection")
      );
    }

    return Promise.reject(error);
  }
);

// Enhanced helper methods
api.helpers = {
  handleError: (error) => {
    console.error("API Error:", error);

    // Network errors
    if (!error.response) {
      return "Network error: Please check your connection";
    }

    // Server errors
    if (error.response?.status >= 500) {
      return "Server error: Please try again later";
    }

    // Specific error messages
    if (error.response?.data?.detail) {
      return error.response.data.detail;
    }

    // Generic error
    return "An unexpected error occurred";
  },
};

export default api;
