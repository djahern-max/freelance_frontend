import axios from 'axios';
import { clearAuthData } from './authCleanup';

// API Routes constants with corrected endpoints
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
  CONVERSATIONS: {
    LIST: '/conversations/user/list',
    DETAIL: (id) => `/conversations/${id}`,
    MESSAGES: (id) => `/conversations/${id}/messages`,
    CREATE: '/conversations/',
  },
  REQUESTS: {
    LIST: '/requests/',
    DETAIL: (id) => `/requests/${id}`,
    PUBLIC: '/requests/public',
    SHARED: '/requests/shared-with-me',
  },
  AGREEMENTS: {
    CREATE: '/agreements/', // Added trailing slash to match backend
    ACCEPT: (id) => `/agreements/${id}/accept`,
    BY_REQUEST: (requestId) => `/agreements/request/${requestId}`,
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

// Enhanced request interceptor with better logging
api.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

    const isPublicRoute = Object.values(API_ROUTES.PUBLIC).some((route) =>
      config.url.startsWith(route)
    );

    if (!isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  async (error) => {
    const errorDetails = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers,
      authHeader: error.config?.headers?.Authorization ? 'Present' : 'Missing',
    };

    console.error('API Error Details:', errorDetails);

    const isPublicRoute = Object.values(API_ROUTES.PUBLIC).some((route) =>
      error.config?.url?.startsWith(route)
    );

    if (!isPublicRoute) {
      if (error.response?.status === 401) {
        clearAuthData();
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        return Promise.reject(
          new Error('Session expired. Please log in again.')
        );
      }

      if (error.response?.status === 403) {
        return Promise.reject(
          new Error('You do not have permission to perform this action.')
        );
      }
    }

    if (error.message.includes('Network Error')) {
      console.error('Network Error Details:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
      return Promise.reject(
        new Error('Unable to connect to server. Please check your connection.')
      );
    }

    if (error.response?.data?.detail) {
      return Promise.reject(new Error(error.response.data.detail));
    }

    return Promise.reject(error);
  }
);

// Enhanced helper methods with better error handling
api.helpers = {
  handleError: (error) => {
    console.error('API Error:', error);

    if (
      error.message.includes('Authentication failed') ||
      error.message.includes('Session expired')
    ) {
      return 'Your session has expired. Please log in again.';
    }

    if (!error.response) {
      return 'Network error: Unable to connect to server';
    }

    switch (error.response.status) {
      case 400:
        return (
          error.response.data?.detail ||
          'Invalid request. Please check your input.'
        );
      case 401:
        return 'Please log in to continue';
      case 403:
        return "You don't have permission to perform this action";
      case 404:
        return 'The requested resource was not found';
      case 422:
        return 'Validation error. Please check your input.';
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

  // Enhanced profile helpers with better error handling
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
        if (error.response?.status === 404) {
          console.log(`No ${userType} profile found`);
          return null;
        }
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

  // Enhanced public route helpers
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

// Enhanced conversation helpers
api.conversations = {
  async list() {
    try {
      const response = await api.get(API_ROUTES.CONVERSATIONS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  async getDetail(id) {
    try {
      const response = await api.get(API_ROUTES.CONVERSATIONS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      throw error;
    }
  },

  async create(data) {
    try {
      const response = await api.post(API_ROUTES.CONVERSATIONS.CREATE, data);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  },

  async sendMessage(id, content) {
    try {
      const response = await api.post(API_ROUTES.CONVERSATIONS.MESSAGES(id), {
        content,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      const response = await api.patch(API_ROUTES.CONVERSATIONS.DETAIL(id), {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating conversation status:', error);
      throw error;
    }
  },
};

// Enhanced agreement helpers with better error handling
api.agreements = {
  async getByRequest(requestId) {
    try {
      const response = await api.get(
        API_ROUTES.AGREEMENTS.BY_REQUEST(requestId)
      );
      console.log('Agreement fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching agreement:', error);
      throw error;
    }
  },

  async create(agreementData) {
    try {
      const response = await api.post(
        API_ROUTES.AGREEMENTS.CREATE,
        agreementData
      );
      console.log('Agreement created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating agreement:', error);
      throw error;
    }
  },

  async accept(id, acceptData) {
    try {
      const response = await api.post(
        API_ROUTES.AGREEMENTS.ACCEPT(id),
        acceptData
      );
      console.log('Agreement accepted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error accepting agreement:', error);
      throw error;
    }
  },
};

// Enhanced token management
api.setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage if exists
const token = localStorage.getItem('token');
if (token) {
  api.setToken(token);
}

export default api;
