import axios from 'axios';
import { clearAuthData } from './authCleanup';



if (process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Suppress 404 errors for profile endpoints and ratings
    if (
      args[0] === 'API Error Details:' &&
      args[1]?.url &&
      (args[1].url.endsWith('/profile/client') ||
        args[1].url.endsWith('/profile/developer') ||
        args[1].url.includes('/ratings/developer/')) && // Add this line
      args[1].status === 404
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

// API Routes constants
export const API_ROUTES = {
  SHOWCASE: {
    LIST: '/project-showcase/',
    CREATE: '/project-showcase/',
    DETAIL: (id) => `/project-showcase/${id}`,
    DEVELOPER: (id) => `/project-showcase/developer/${id}`,
    RATING: (id) => `/project-showcase/${id}/rating`,
    USER_RATING: (id) => `/project-showcase/${id}/user-rating`,
    SHARE: (id) => `/project-showcase/${id}/share`,
    README: (id) => `/project-showcase/${id}/readme`,
    FILES: (id) => `/project-showcase/${id}/files`,
    VIDEOS: (id) => `/project-showcase/${id}/videos`,
    PROFILE: (id) => `/project-showcase/${id}/profile`

  },
  VIDEOS: {
    DISPLAY: '/video_display',
    SHARE: (id) => `/videos/${id}/share`,
  },
  RATINGS: {
    DEVELOPER: (id) => `/ratings/developer/${id}`,

    DEVELOPER_RATING: (id) => `/ratings/developer/${id}/rating`, // Add this new route
  },
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
    CREATE: '/agreements/',
    ACCEPT: (id) => `/agreements/${id}/accept`,
    BY_REQUEST: (requestId) => `/agreements/request/${requestId}`,
  },
  PAYMENTS: {
    CREATE_SUBSCRIPTION: '/payments/create-subscription',
    SUBSCRIPTION_STATUS: '/payments/subscription-status',
  },
  PROJECTS: {
    LIST: '/projects/',
    CREATE: '/projects/',
    DETAIL: (id) => `/projects/${id}/`,
    ADD_REQUEST: (requestId) => `/requests/${requestId}/project`,
  },
  SNAGGED_REQUESTS: {
    CREATE: '/snagged-requests/',
    LIST: '/snagged-requests/',
    REMOVE: (id) => `/snagged-requests/${id}`
  },

};

// Helper function to check if a route is public
// In api.js
const isPublicRoute = (url) => {
  // Remove trailing slash for comparison
  const normalizedUrl = url.replace(/\/$/, '');
  const publicRoutes = [
    ...Object.values(API_ROUTES.PUBLIC),
    '/video_display', // Add this explicitly
  ];
  return publicRoutes.some(
    (route) => normalizedUrl === route || normalizedUrl.startsWith(route + '/')
  );
};

const getBaseURL = () => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  return process.env.NODE_ENV === 'production'
    ? 'https://www.ryze.ai/api'
    : 'http://localhost:8000';
};

// Create axios instance with default config
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // Add timeout here
});

// Request interceptor with enhanced error handling
api.interceptors.request.use(
  (config) => {
    // Add right after this line
    config.retries = config.retries || 3;
    config.retryCount = config.retryCount || 0;

    // Log requests in development
    if (process.env.NODE_ENV === 'development') {

    }

    // Add auth token for non-public routes
    if (!isPublicRoute(config.url)) {
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

// Response interceptor with comprehensive error handling
// In api.js, update the response interceptor

// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {

    }
    return response;
  },
  async (error) => {
    // Handle cancellations first, before any other error processing
    if (error.name === 'CanceledError' || error.message === 'canceled') {
      return Promise.reject(new Error('REQUEST_CANCELLED'));
    }

    // Get the original request configuration from the error object
    const config = error.config;

    // Log detailed error information
    const errorDetails = {
      url: config?.url,
      method: config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      retryCount: config?.retryCount || 0,
    };
    console.error('API Error Details:', errorDetails);

    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(
          new Error('Request timed out. Please try again.')
        );
      }
      return Promise.reject(
        new Error('Network error. Please check your connection.')
      );
    }

    // Handle retry logic for 5xx errors
    if (
      error.response.status >= 500 &&
      config?.retries > (config?.retryCount || 0)
    ) {
      config.retryCount = (config.retryCount || 0) + 1;
      return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
        api(config)
      );
    }

    // Handle specific error status codes
    switch (error.response.status) {
      case 401:
        clearAuthData();
        if (
          !window.location.pathname.includes('/login') &&
          !isPublicRoute(config.url)
        ) {
          window.location.href = '/login';
        }
        return Promise.reject(
          new Error('Session expired. Please log in again.')
        );

      case 403:
        if (error.response.data?.detail?.includes('subscription')) {
          return Promise.reject(new Error('Subscription required or expired.'));
        }
        return Promise.reject(
          new Error('You do not have permission to perform this action.')
        );

      case 404:
        // Special handling for profile endpoints
        if (
          config.url === '/profile/client' ||
          config.url === '/profile/developer'
        ) {
          return Promise.resolve({ data: null });
        }
        return Promise.reject(
          new Error('The requested resource was not found.')
        );

      case 422:
        return Promise.reject(
          new Error('Validation error. Please check your input.')
        );

      case 429:
        return Promise.reject(
          new Error('Too many requests. Please try again later.')
        );

      default:
        return Promise.reject(
          new Error(
            error.response.data?.detail || 'An unexpected error occurred.'
          )
        );
    }
  }
);

api.helpers = {
  handleError: (error) => {
    console.error('API Error:', error);

    if (error.message.includes('Network Error')) {
      return 'Unable to connect to server. Please check your connection.';
    }

    if (!error.response) {
      return error.message || 'An unexpected error occurred';
    }

    // Return user-friendly error messages based on status code
    switch (error.response.status) {
      case 400:
        // Handle marketplace products
        if (error.config.url.includes('/marketplace/products')) {
          if (error.response.data?.detail?.includes('insufficient_funds')) {
            return 'Insufficient funds for purchase.';
          }
          if (error.response.data?.detail?.includes('already_purchased')) {
            return 'You have already purchased this product.';
          }
        }
        // Handle project showcase
        if (error.config.url.includes('/project-showcase')) {
          if (error.response.data?.detail?.includes('cannot_rate_own')) {
            return 'You cannot rate your own showcase.';
          }
          if (error.response.data?.detail?.includes('invalid_video_ids')) {
            return 'One or more selected videos are invalid.';
          }
        }
        return error.response.data?.detail || 'Invalid request. Please check your input.';
      case 401:
        return 'Please log in to continue';
      case 403:
        if (error.response.data?.detail?.includes('subscription')) {
          return 'Active subscription required to perform this action';
        }
        return "You don't have permission to perform this action";
      case 404:
        // Special handling for profile endpoints
        if (
          error.config.url.endsWith('/profile/client') ||
          error.config.url.endsWith('/profile/developer')
        ) {
          return { data: null }; // Return null data instead of rejecting
        }
        return 'The requested resource was not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later';
      default:
        return error.response?.data?.detail || 'An unexpected error occurred';
    }
  },

  checkAuthState: () => {
    const token = localStorage.getItem('token');
    if (process.env.NODE_ENV === 'development') {

    }
    return !!token;
  },
};

// Profile-related API methods
// Profile-related API methods
api.profile = {
  async fetchUserProfile() {
    try {
      const response = await api.get('/profile/me');

      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async fetchSpecificProfile(userType) {
    try {
      const endpoint =
        userType === 'developer' ? '/profile/developer' : '/profile/client';
      const response = await api.get(endpoint);
      return response.data;
    } catch (error) {
      // Handle 404 case first
      if (error.response?.status === 404) {

        return null;
      }

      // If it's an error from the response interceptor that's already been handled
      if (error.response?.data === null) {
        return null;
      }

      // For network errors or other issues
      if (!error.response) {
        throw new Error('Network error. Please check your connection.');
      }

      // For any other error, use the helper
      const errorMessage = api.helpers.handleError(error);
      if (errorMessage?.data === null) {
        return null;
      }

      throw new Error(errorMessage);
    }
  },

  async updateProfile(userType, profileData) {
    try {
      const endpoint =
        userType === 'developer' ? '/profile/developer' : '/profile/client';
      const response = await api.put(endpoint, profileData);
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async createProfile(userType, profileData) {
    try {
      const endpoint =
        userType === 'developer' ? '/profile/developer' : '/profile/client';
      const response = await api.post(endpoint, profileData);
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },
};

// Subscription-related API methods
api.subscriptions = {
  async create() {
    try {
      const response = await api.post('/payments/create-subscription');
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getStatus() {
    try {
      const response = await api.get('/payments/subscription-status');
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },
};

// Agreement-related API methods
// Agreement-related API methods
api.agreements = {
  async getByRequest(requestId) {
    try {
      const response = await api.get(`/agreements/request/${requestId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(api.helpers.handleError(error));
    }
  },

  async create(agreementData) {
    try {
      const response = await api.post('/agreements/', agreementData);
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async accept(id, acceptData) {
    try {
      const response = await api.post(`/agreements/${id}/accept`, acceptData);
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },
};

api.videos = {
  async shareVideo(videoId, projectUrl) {
    try {
      const response = await api.post(API_ROUTES.VIDEOS.SHARE(videoId), {
        project_url: projectUrl
      });
      return response.data;
    } catch (error) {
      console.error('Error sharing video:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },



  async getDisplayVideos() {
    try {
      const response = await api.get(API_ROUTES.VIDEOS.DISPLAY);
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw new Error(api.helpers.handleError(error));
    }
  }
};



// Add the ratings methods as a separate object

api.ratings = {
  async rateDeveloper(developerId, ratingData) {

    try {
      const response = await api.post(
        API_ROUTES.RATINGS.DEVELOPER(developerId),
        {
          stars: ratingData.stars,
          comment: ratingData.comment || '',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Rating error:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getDeveloperRating(developerId) {
    try {
      const response = await api.get(
        API_ROUTES.RATINGS.DEVELOPER_RATING(developerId)
      );
      return response.data;
    } catch (error) {
      // For 404s or any error, return default rating structure
      return {
        average_rating: 0,
        total_ratings: 0,
        rating_distribution: {},
      };
    }
  },

  async getUserRating(developerId) {
    try {
      const response = await api.get(
        API_ROUTES.RATINGS.USER_RATING(developerId)
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        return null;
      }
      throw new Error(api.helpers.handleError(error));
    }
  },
};

// Add conversation helpers
api.conversations = {
  async list() {
    try {
      const response = await api.get(API_ROUTES.CONVERSATIONS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },





  async getDetail(id) {
    try {
      const response = await api.get(API_ROUTES.CONVERSATIONS.DETAIL(id));
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async create(data) {
    try {
      const response = await api.post(API_ROUTES.CONVERSATIONS.CREATE, data);
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw new Error(api.helpers.handleError(error));
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
      throw new Error(api.helpers.handleError(error));
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
      throw new Error(api.helpers.handleError(error));
    }
  },
};




// Add snagged requests methods
api.snaggedRequests = {
  async create(requestId, data) {
    try {

      const response = await api.post(API_ROUTES.SNAGGED_REQUESTS.CREATE, {
        request_id: requestId,
        message: data.message,
        video_ids: data.video_ids || [],
        profile_link: data.include_profile,
        include_profile: data.include_profile
      });

      return response.data;
    } catch (error) {
      console.error('Error creating snagged request:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },


  async list() {
    try {
      const response = await api.get(API_ROUTES.SNAGGED_REQUESTS.LIST);
      return response.data;
    } catch (error) {
      console.error('Error fetching snagged requests:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async remove(requestId) {
    try {
      const response = await api.delete(API_ROUTES.SNAGGED_REQUESTS.REMOVE(requestId));
      return response.data;
    } catch (error) {
      console.error('Error removing snagged request:', error);
      throw new Error(api.helpers.handleError(error));
    }
  }
};

api.showcase = {
  async list() {
    try {
      const response = await api.get(API_ROUTES.SHOWCASE.LIST);
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async create(showcaseData) {
    try {
      const formData = new FormData();

      // Handle basic fields
      const basicFields = ['title', 'description', 'project_url', 'repository_url', 'demo_url', 'include_profile'];
      basicFields.forEach(field => {
        if (showcaseData[field] !== undefined) {
          formData.append(field, showcaseData[field]);
        }
      });

      // Handle files
      if (showcaseData.image_file) {
        formData.append('image_file', showcaseData.image_file);
      }
      if (showcaseData.readme_file) {
        formData.append('readme_file', showcaseData.readme_file);
      }

      // Handle video IDs
      if (showcaseData.selected_video_ids) {
        formData.append('selected_video_ids', JSON.stringify(showcaseData.selected_video_ids));
      }

      const response = await api.post(API_ROUTES.SHOWCASE.CREATE, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async update(id, data) {
    try {
      if (data instanceof FormData) {
        const response = await api.put(API_ROUTES.SHOWCASE.FILES(id), data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
      const response = await api.put(API_ROUTES.SHOWCASE.DETAIL(id), data);
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getDetail(id) {
    try {
      const response = await api.get(API_ROUTES.SHOWCASE.DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getReadme(id, format = 'html') {
    try {
      const response = await api.get(`${API_ROUTES.SHOWCASE.README(id)}?format=${format}`);
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async submitRating(showcaseId, rating) {
    try {
      const response = await api.post(API_ROUTES.SHOWCASE.RATING(showcaseId), { stars: rating });
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getRating(showcaseId) {
    try {
      const response = await api.get(API_ROUTES.SHOWCASE.RATING(showcaseId));
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return { average_rating: 0, total_ratings: 0 };
      }
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getUserRating(showcaseId) {
    try {
      const response = await api.get(API_ROUTES.SHOWCASE.USER_RATING(showcaseId));
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(api.helpers.handleError(error));
    }
  },

  async delete(id) {
    try {
      const response = await api.delete(API_ROUTES.SHOWCASE.DETAIL(id));
      return response.data;
    } catch (error) {
      throw new Error(api.helpers.handleError(error));
    }
  }
};



// Token management
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