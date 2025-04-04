// src/utils/apiService.js
import axios from 'axios';

// Define the API URL with fallback
const API_URL = process.env.REACT_APP_API_URL || 'https://www.ryze.ai/api';

// Create an axios instance with baseURL
const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15 second timeout
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookies/sessions
});

// Add request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle 401 Unauthorized errors
        if (error.response && error.response.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token');

            // Only redirect if we're not already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

const apiService = {
    // Auth-related methods
    setAuthToken: (token) => {
        if (token) {
            localStorage.setItem('token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
        }
    },

    clearAuthToken: () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
    },

    // OAuth URL generators - UPDATED to remove the double /api prefix
    getGoogleOAuthUrl: () => {
        return `${API_URL}/auth/google`;
    },

    getGithubOAuthUrl: () => {
        return `${API_URL}/auth/github`;
    },

    getLinkedinOAuthUrl: () => {
        return `${API_URL}/auth/linkedin`;
    },

    // Basic HTTP methods
    get: (url, config = {}) => {
        return api.get(url, config);
    },

    post: (url, data = {}, config = {}) => {
        return api.post(url, data, config);
    },

    put: (url, data = {}, config = {}) => {
        return api.put(url, data, config);
    },

    delete: (url, config = {}) => {
        return api.delete(url, config);
    },

    // File upload method with progress tracking
    uploadFile: (url, file, onUploadProgress, config = {}) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.post(url, formData, {
            ...config,
            headers: {
                ...config.headers,
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (onUploadProgress) {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    onUploadProgress(percentCompleted);
                }
            },
        });
    },
};

export default apiService;