// redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const loadInitialState = () => {
  const token = localStorage.getItem("authToken");
  const userId = localStorage.getItem("userId");
  const username = localStorage.getItem("username");

  return {
    isAuthenticated: !!token, // Convert to boolean
    user: {
      id: userId || null,
      username: username || null,
    },
    token: token || null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: loadInitialState(), // Use the function to load initial state
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = {
        id: action.payload.userId,
        username: action.payload.username,
      };
      state.token = action.payload.token;

      // Store in localStorage
      localStorage.setItem("authToken", action.payload.token);
      localStorage.setItem("userId", action.payload.userId);
      localStorage.setItem("username", action.payload.username);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = {
        id: null,
        username: null,
      };
      state.token = null;

      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
