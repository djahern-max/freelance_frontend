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
    Accept: "application/json", // Make sure this is set
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Add explicit accept header for this specific endpoint
      if (config.url === "/requests") {
        config.headers.Accept = "application/json";
      }
      console.log("Full Request Details:", {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: config.headers,
        baseURL: config.baseURL,
        withCredentials: config.withCredentials,
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
    // Add content-type checking
    const contentType = response.headers["content-type"];
    if (
      response.config.url === "/requests" &&
      !contentType?.includes("application/json")
    ) {
      console.warn(`Unexpected content type for /requests: ${contentType}`);
      // You might want to reject these responses
      // return Promise.reject(new Error(`Unexpected content type: ${contentType}`));
    }
    console.log("API Success Response:", {
      url: response.config.url,
      status: response.status,
      contentType: response.headers["content-type"],
      data: response.data,
    });
    return response;
  },
  async (error) => {
    console.error("API Error Details:", {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
      contentType: error.response?.headers?.["content-type"],
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
