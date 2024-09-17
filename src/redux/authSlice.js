// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null, // Store the JWT token here
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.username;
      state.token = action.payload.token; // Store the token
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null; // Clear the token
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
