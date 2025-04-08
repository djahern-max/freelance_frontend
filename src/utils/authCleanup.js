// src/utils/authCleanup.js
import { store } from "../redux/store";
import { logout } from "../redux/authSlice";
import axios from "axios";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/home',
  '/login',
  '/register',
  '/oauth/callback',
  '/auth/github/callback',
  '/auth/google/callback',
  '/terms',
  '/privacy'
];

export const clearAuthData = () => {
  // Clear localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("authState");

  // Clear sessionStorage
  sessionStorage.clear();

  // Dispatch Redux action
  store.dispatch(logout());
};

export const handleApiError = (error) => {
  if (
    error.response &&
    (error.response.status === 401 || error.response.status === 403)
  ) {
    clearAuthData();

    // Check if current path is a public route
    const currentPath = window.location.pathname;
    const isPublicRoute = PUBLIC_ROUTES.some(route =>
      currentPath === route || currentPath.startsWith(route + '/')
    );

    // Only redirect if not on a public route
    if (!isPublicRoute) {
      // Store current path for redirect after login
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      window.location.href = "/login";
    }
  }
  throw error;
};

// Setup axios interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    handleApiError(error);
    return Promise.reject(error);
  }
);