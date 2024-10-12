import { createSlice } from "@reduxjs/toolkit";

const storedToken = localStorage.getItem("authToken");

const initialState = {
  isAuthenticated: !!storedToken,
  user: null,
  token: storedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.username;
      state.token = action.payload.token;
      localStorage.setItem("authToken", action.payload.token);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem("authToken");
    },
  },
});

export const { login, logout } = authSlice.actions;

export default authSlice.reducer;
