// src/redux/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

// Helper function to safely parse JSON
const safeJSONParse = (str, fallback = null) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (err) {
    console.error('Error parsing stored user data:', err);
    return fallback;
  }
};

// Helper function to normalize user data
const normalizeUserData = (userData) => {
  if (!userData) return null;

  return {
    id: userData.id,
    username: userData.username,
    email: userData.email,
    fullName: userData.full_name || userData.fullName,
    isActive: userData.is_active || userData.isActive,
    userType: userData.user_type || userData.userType,
    createdAt: userData.created_at || userData.createdAt,
    needsRoleSelection: userData.needs_role_selection || userData.needsRoleSelection || false,
  };
};

// Initial state with type checking and logging
const initialState = {
  token: localStorage.getItem('token'),
  user: normalizeUserData(safeJSONParse(localStorage.getItem('user'))),
  isAuthenticated: !!localStorage.getItem('token'),
  error: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    login: (state, action) => {
      const { token, user } = action.payload;

      // Basic validation
      if (!user) {
        console.error('Invalid user data received:', user);
        state.error = 'Invalid user data';
        return;
      }

      // Normalize user data using helper function
      const normalizedUser = normalizeUserData(user);

      if (!normalizedUser) {
        console.error('Failed to normalize user data:', user);
        state.error = 'Failed to process user data';
        return;
      }

      // Update state
      state.token = token;
      state.user = normalizedUser;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Update localStorage
      try {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch (err) {
        console.error('Error storing auth data:', err);
        // Continue even if localStorage fails
      }
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    logout: (state) => {
      // Clear state
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;

      // Clear localStorage
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (err) {
        console.error('Error clearing auth data:', err);
      }
    },
    updateUser: (state, action) => {
      // Normalize the updated user data
      const updatedUser = normalizeUserData({
        ...state.user,
        ...action.payload,
      });

      if (!updatedUser) {
        console.error('Failed to update user data:', action.payload);
        return;
      }

      state.user = updatedUser;
      try {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (err) {
        console.error('Error updating user data in localStorage:', err);
      }
    },
    updateUserType: (state, action) => {
      if (state.user) {
        const updatedUser = {
          ...state.user,
          userType: action.payload,
          needsRoleSelection: false
        };

        state.user = updatedUser;

        try {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (err) {
          console.error('Error updating user type in localStorage:', err);
        }
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserType = (state) => state.auth.user?.userType;
export const selectNeedsRoleSelection = (state) => state.auth.user?.needsRoleSelection;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.loading;

// Actions
export const {
  login,
  loginStart,
  loginFailure,
  logout,
  updateUser,
  updateUserType,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;