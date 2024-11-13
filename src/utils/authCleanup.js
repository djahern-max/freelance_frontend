import { store } from "../redux/store";
import { logout } from "../redux/authSlice";
import axios from "axios";

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
    // Only redirect if not already on login page
    if (!window.location.pathname.includes("/login")) {
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
