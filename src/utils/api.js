// utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
