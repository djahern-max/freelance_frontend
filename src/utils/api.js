import axios from 'axios';
import { clearAuthData } from './authCleanup';

// API Routes constants
export const API_ROUTES = {
  PROFILE: {
    ME: '/profile/me',
    DEVELOPER: '/profile/developer',
    CLIENT: '/profile/client',
  },
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
  },
  PUBLIC: {
    REQUESTS: '/requests/public',
    DEVELOPERS: '/profile/developers/public',
    VIDEOS: '/video_display',
  },
};

const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return process.env.NODE_ENV === 'production'
    ? '/api'
    : 'http://localhost:8000';
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Full Request URL:', `${config.baseURL}${config.url}`);

    // Check if the route is public
    const isPublicRoute = Object.values(API_ROUTES.PUBLIC).some((route) =>
      config.url.startsWith(route)
    );

    // Only add auth header for non-public routes
    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        headers: response.headers,
        contentType: response.headers['content-type'],
      });
    }
    return response;
  },
  async (error) => {
    // Log detailed error information
    const errorDetails = {
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.config?.headers,
      authHeader: error.config?.headers?.Authorization ? 'Present' : 'Missing',
    };

    console.error('API Error Details:', errorDetails);

    // Check if the route is public
    const isPublicRoute = Object.values(API_ROUTES.PUBLIC).some((route) =>
      error.config?.url?.startsWith(route)
    );

    // Only handle auth errors for non-public routes
    if (!isPublicRoute && error.response?.status === 401) {
      console.log('Authentication error - token might be invalid or expired');
      clearAuthData();

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(
        new Error('Authentication failed - please log in again')
      );
    }

    if (error.response?.status === 403) {
      console.log('Authorization error - insufficient permissions');
      return Promise.reject(
        new Error("You don't have permission to perform this action")
      );
    }

    if (error.message.includes('Network Error')) {
      console.error('Possible CORS or network error:', error);
      return Promise.reject(
        new Error('Unable to connect to server. Please check your connection.')
      );
    }

    return Promise.reject(error);
  }
);

// Helper methods
api.helpers = {
  handleError: (error) => {
    console.error('API Error:', error);

    if (error.message.includes('Authentication failed')) {
      return 'Your session has expired. Please log in again.';
    }

    if (!error.response) {
      return 'Network error: Unable to connect to server';
    }

    switch (error.response.status) {
      case 401:
        return 'Please log in to continue';
      case 403:
        return "You don't have permission to perform this action";
      case 404:
        return 'The requested resource was not found';
      case 500:
        return 'Server error: Please try again later';
      default:
        return error.response?.data?.detail || 'An unexpected error occurred';
    }
  },

  checkAuthState: () => {
    const token = localStorage.getItem('token');
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth State Check:', {
        hasToken: !!token,
        tokenPreview: token ? `${token.substr(0, 10)}...` : null,
      });
    }
    return !!token;
  },

  // Profile-specific helpers
  profile: {
    async fetchUserProfile() {
      try {
        const response = await api.get(API_ROUTES.PROFILE.ME);
        console.log('User profile fetched:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }
    },

    async fetchSpecificProfile(userType) {
      try {
        const endpoint =
          userType === 'developer'
            ? API_ROUTES.PROFILE.DEVELOPER
            : API_ROUTES.PROFILE.CLIENT;
        const response = await api.get(endpoint);
        console.log(`${userType} profile fetched:`, response.data);
        return response.data;
      } catch (error) {
        // If it's a 404, return null instead of throwing
        if (error.response?.status === 404) {
          console.log(`No ${userType} profile found`);
          return null;
        }
        // For other errors, throw as usual
        console.error(`Error fetching ${userType} profile:`, error);
        throw error;
      }
    },

    async createProfile(userType, profileData) {
      try {
        const endpoint =
          userType === 'developer'
            ? API_ROUTES.PROFILE.DEVELOPER
            : API_ROUTES.PROFILE.CLIENT;
        const response = await api.post(endpoint, profileData);
        console.log(`${userType} profile created:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error creating ${userType} profile:`, error);
        throw error;
      }
    },

    async updateProfile(userType, profileData) {
      try {
        const endpoint =
          userType === 'developer'
            ? API_ROUTES.PROFILE.DEVELOPER
            : API_ROUTES.PROFILE.CLIENT;
        const response = await api.put(endpoint, profileData);
        console.log(`${userType} profile updated:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`Error updating ${userType} profile:`, error);
        throw error;
      }
    },
  },

  // Public route helpers
  public: {
    async getPublicRequests(params = {}) {
      try {
        const response = await api.get(API_ROUTES.PUBLIC.REQUESTS, { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching public requests:', error);
        throw error;
      }
    },

    async getPublicDevelopers(params = {}) {
      try {
        const response = await api.get(API_ROUTES.PUBLIC.DEVELOPERS, {
          params,
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching public developers:', error);
        throw error;
      }
    },

    async getPublicVideos(params = {}) {
      try {
        const response = await api.get(API_ROUTES.PUBLIC.VIDEOS, { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching public videos:', error);
        throw error;
      }
    },
  },
};

// Token management methods
api.setToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage if exists
const token = localStorage.getItem('token');
if (token) {
  api.setToken(token);
}

export default api;
