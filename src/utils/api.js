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
    DISPLAY: '/video_display/',
    SHARE: (id) => `/videos/${id}/share`,
    GET_SHARED: (token) => `/video_display/shared/${token}`, // Add this line
  },
  RATINGS: {
    DEVELOPER: (id) => `/ratings/developer/${id}`,
    DEVELOPER_RATING: (id) => `/ratings/developer/${id}/rating`,
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
  MARKETPLACE: {
    PRODUCTS: '/marketplace/products',
    PRODUCT_DETAIL: (id) => `/marketplace/products/${id}`,
    PURCHASE: (id) => `/marketplace/products/${id}/purchase`,
    FILES: (id) => `/marketplace/products/files/${id}`,
    VERIFY_PURCHASE: (sessionId) => `/marketplace/purchase/verify/${sessionId}`,
    UPLOAD_FILES: (id) => `/marketplace/products/${id}/files`,
    GET_FILES_INFO: (id) => `/marketplace/products/${id}/files/info`,
    REVIEWS: (id) => `/marketplace/products/${id}/reviews`,
  },
  // Add this new section
  PLAYLISTS: {
    LIST: '/playlists/',
    USER: (userId) => `/playlists/user/${userId}`,
    DETAIL: (id) => `/playlists/${id}`,
    ADD_VIDEO: (playlistId, videoId) => `/playlists/${playlistId}/videos/${videoId}`,
    VIDEO_PLAYLISTS: (videoId) => `/playlists/video/${videoId}`,
    SHARE: (id) => `/playlists/${id}/share`,
    SHARED: (token) => `/playlists/shared/${token}`, // Keep this as is
    GET_SHARED: (token) => `/playlists/shared/${token}` // Add this line for consistency
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
    ? 'https://www.danejahern.com/api'
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

const pendingRequests = new Map();

// Request interceptor with enhanced error handling
// Update your existing request interceptor (around line 131)
api.interceptors.request.use(
  (config) => {
    // Existing config setup
    config.retries = config.retries || 3;
    config.retryCount = config.retryCount || 0;

    // Add request deduplication
    const requestKey = `${config.method}:${config.url}`;

    // Cancel any pending requests with the same key
    if (pendingRequests.has(requestKey)) {
      pendingRequests.get(requestKey).abort();
    }

    // Create new controller for this request
    const controller = new AbortController();
    config.signal = controller.signal;
    pendingRequests.set(requestKey, controller);

    // Rest of your existing request interceptor code
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        url: `${config.baseURL}${config.url}`,
        method: config.method,
        headers: config.headers,
        data: config.data,
      });
    }

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
    if (process.env.NODE_ENV === 'development' && error.config) {
      console.log('%c🔍 OUTGOING REQUEST', 'color: blue; font-weight: bold;');
      console.log('➡️ URL:', `${error.config.baseURL}${error.config.url}`);
      console.log('➡️ Method:', error.config.method);
      console.log('➡️ Headers:', error.config.headers);
      console.log('➡️ Data:', error.config.data);
    }

    return Promise.reject(error);
  }
);


// Response interceptor with comprehensive error handling
api.interceptors.response.use(
  (response) => {
    // Add cleanup for pending requests
    const requestKey = `${response.config.method}:${response.config.url}`;
    pendingRequests.delete(requestKey);

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
    // Add cleanup for pending requests in error case
    const requestKey = `${error.config?.method}:${error.config?.url}`;
    pendingRequests.delete(requestKey);

    // Rest of your existing error handling code
    if (error.name === 'CanceledError' || error.message === 'canceled' ||
      error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED') {
      console.log('Request was cancelled or aborted');
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
        if (error.config.url.includes('/marketplace/products')) {
          if (error.response.data?.detail?.includes('insufficient_funds')) {
            return 'Insufficient funds for purchase.';
          }
          if (error.response.data?.detail?.includes('already_purchased')) {
            return 'You have already purchased this product.';
          }
        }
        return error.response.data?.detail || 'Invalid request. Please check your input.';

      case 400:
        if (error.config.url.includes('/project-showcase')) {
          if (error.response.data?.detail?.includes('cannot_rate_own')) {
            return 'You cannot rate your own showcase.';
          }
          if (error.response.data?.detail?.includes('invalid_video_ids')) {
            return 'One or more selected videos are invalid.';
          }
        }

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
        // Check if error is related to database tables not existing
        if (
          error.response.data?.detail?.includes('relation') ||
          error.response.data?.detail?.includes('table') ||
          error.message?.includes('relation') ||
          error.message?.includes('table')
        ) {
          console.warn('Database schema error - possible database reset:', error.response?.data);
          // For playlist-related endpoints, return empty data
          if (error.config.url.includes('/playlists')) {
            if (error.config.method === 'get') {
              // Return empty array or null based on endpoint
              return Promise.resolve({
                data: error.config.url.includes('/user/') || error.config.url.includes('/video/') ? [] : null
              });
            }
            return Promise.reject(
              new Error('The playlist service is temporarily unavailable. Please try again later.')
            );
          }
        }
        return Promise.reject(
          new Error('Server error. Please try again later.')
        );
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
};

// Profile-related API methods
// Profile-related API methods
api.profile = {
  async fetchUserProfile() {
    try {
      const response = await api.get('/profile/me');
      console.log('User Profile Response:', response.data);
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
        console.log(`No ${userType} profile found, returning null`);
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
      // Log the parameters for debugging
      console.log('Sharing video:', videoId, 'with project URL:', projectUrl);

      const response = await api.post(`/videos/${videoId}/share`, {
        project_url: projectUrl
      });

      // Log the full response for debugging
      console.log('Share video API response:', response.data);

      // Extract the share token from the response
      // If response.data is a string, parse it
      const responseData = typeof response.data === 'string'
        ? JSON.parse(response.data)
        : response.data;

      // Extract the token from whatever format the server returns
      let shareToken;
      if (responseData.share_token) {
        shareToken = responseData.share_token;
      } else if (responseData.share_url) {
        // Extract token from URL if that's what's returned
        const urlParts = responseData.share_url.split('/');
        shareToken = urlParts[urlParts.length - 1];
      } else {
        throw new Error('Invalid response format from server');
      }

      // Make sure we have a token
      if (!shareToken) {
        throw new Error('No share token returned from server');
      }

      // Build the correct URL
      const shareUrl = `${window.location.origin}/shared/videos/${shareToken}`;

      return {
        share_token: shareToken,
        share_url: shareUrl
      };
    } catch (error) {
      console.error('Error sharing video:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getDisplayVideos() {
    try {
      // Always use trailing slash to avoid 307 redirects
      const response = await api.get('/video_display/');
      return response.data;
    } catch (error) {
      // Don't throw for cancelled requests
      if (error.message === 'REQUEST_CANCELLED') {
        console.log('Video display request was cancelled');
        return { user_videos: [], other_videos: [] };
      }
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  async getSharedVideo(shareToken) {
    try {
      const response = await api.get(API_ROUTES.VIDEOS.GET_SHARED(shareToken));
      return response.data;
    } catch (error) {
      console.error('Error fetching shared video:', error);
      throw new Error(api.helpers.handleError(error));
    }
  }
};



// Add the ratings methods as a separate object

api.ratings = {
  async rateDeveloper(developerId, ratingData) {
    console.log('Rating developer:', developerId, 'with data:', ratingData);
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
      console.log('Creating snagged request:', { requestId, ...data });
      const response = await api.post(API_ROUTES.SNAGGED_REQUESTS.CREATE, {
        request_id: requestId,
        message: data.message,
        video_ids: data.video_ids || [],
        profile_link: data.include_profile,
        include_profile: data.include_profile
      });
      console.log('Snagged request response:', response.data);
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
api.playlists = {
  async getPlaylistDetails(playlistId) {
    try {
      const response = await api.get(`/playlists/${playlistId}`);
      return response.data;
    } catch (error) {
      // Handle 404 errors specifically for playlists
      if (error.response?.status === 404) {
        console.log(`Playlist with ID ${playlistId} not found - returning null`);
        return null;
      }
      // Handle database reset scenarios gracefully
      if (error.response?.status === 500) {
        console.log('Playlist database may be unavailable');
        return null;
      }
      console.error('Error fetching playlist details:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },
  async getUserPlaylists(userId) {
    try {
      const response = await api.get(`/playlists/user/${userId}`);
      return response.data;
    } catch (error) {
      // Handle database reset scenarios gracefully
      if (error.response?.status === 500 || error.response?.status === 404) {
        console.log('Playlist database may be unavailable - returning empty list');
        return [];
      }
      console.error('Error fetching user playlists:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getPlaylistDetails(playlistId) {
    try {
      const response = await api.get(`/playlists/${playlistId}`);
      return response.data;
    } catch (error) {
      // Handle database reset scenarios gracefully
      if (error.response?.status === 500 || error.response?.status === 404) {
        console.log('Playlist database may be unavailable');
        return null;
      }
      console.error('Error fetching playlist details:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async createPlaylist(playlistData) {
    try {
      const response = await api.post('/playlists/', playlistData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500) {
        console.error('Database error when creating playlist');
        throw new Error('Unable to create playlist. The service may be temporarily unavailable.');
      }
      console.error('Error creating playlist:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async addVideoToPlaylist(playlistId, videoId, order = null) {
    try {
      const url = order !== null
        ? `/playlists/${playlistId}/videos/${videoId}?order=${order}`
        : `/playlists/${playlistId}/videos/${videoId}`;

      const response = await api.post(url);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500) {
        console.error('Database error when adding video to playlist');
        throw new Error('Unable to add video to playlist. The service may be temporarily unavailable.');
      }
      console.error('Error adding video to playlist:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async updatePlaylist(playlistId, playlistData) {
    try {
      const response = await api.put(`/playlists/${playlistId}`, playlistData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500) {
        console.error('Database error when updating playlist');
        throw new Error('Unable to update playlist. The service may be temporarily unavailable.');
      }
      console.error('Error updating playlist:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async deletePlaylist(playlistId) {
    try {
      const response = await api.delete(`/playlists/${playlistId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 500) {
        console.error('Database error when deleting playlist');
        throw new Error('Unable to delete playlist. The service may be temporarily unavailable.');
      }
      console.error('Error deleting playlist:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getVideoPlaylists(videoId) {
    try {
      const response = await api.get(`/playlists/video/${videoId}`);
      return response.data;
    } catch (error) {
      // Handle database reset scenarios gracefully
      if (error.response?.status === 500 || error.response?.status === 404) {
        console.log('Playlist database may be unavailable - returning empty list');
        return [];
      }
      console.error('Error fetching video playlists:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async generateShareLink(playlistId) {
    try {
      const response = await api.post(`/playlists/${playlistId}/share`);

      // Make sure we have a token
      if (!response.data.share_token) {
        throw new Error('No share token returned from server');
      }

      // Build URL with consistent path structure
      const shareUrl = `${window.location.origin}/shared/playlists/${response.data.share_token}`;

      return {
        share_token: response.data.share_token,
        share_url: shareUrl
      };
    } catch (error) {
      console.error('Error generating share link:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },

  async getSharedPlaylist(shareToken) {
    try {
      // Log for debugging
      console.log('Fetching shared playlist with token:', shareToken);

      // Make sure we have a token
      if (!shareToken) {
        console.error('Missing share token');
        throw new Error('Invalid share token');
      }

      // Use the API endpoint for shared playlists
      const response = await api.get(`/playlists/shared/${shareToken}`);

      // Log response for debugging
      console.log('Shared playlist API response:', response.data);

      return response.data;
    } catch (error) {
      console.error('Error fetching shared playlist:', error);

      // Handle 404 errors
      if (error.response?.status === 404) {
        return null;
      }

      throw new Error(api.helpers.handleError(error));
    }
  },
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
  },
  async linkVideo(showcaseId, videoId) {
    try {
      const response = await api.post(`/project-showcase/${showcaseId}/link-video/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error linking video to showcase:', error);
      throw new Error(api.helpers.handleError(error));
    }
  },
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