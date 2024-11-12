// src/utils/api.js
import axios from "axios";

// Determine the base URL based on environment
const getBaseURL = () => {
  if (process.env.NODE_ENV === "production") {
    // In production, we use relative path since NGINX handles the routing
    return "/api";
  }
  // In development, use the full localhost URL
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

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Request Config:", {
        url: config.url,
        method: config.method,
        headers: config.headers,
        baseURL: config.baseURL,
      });
    } else {
      console.warn("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("API Success Response:", {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error("API Error Response:", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
    });

    if (error.response?.status === 401) {
      console.log("Unauthorized access - clearing auth data");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
