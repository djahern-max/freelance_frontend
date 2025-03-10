// apiService.js with improved OAuth URL handling

import axios from 'axios';

const apiService = {
    // Base API URL from environment variable
    baseUrl: process.env.REACT_APP_API_URL || '',

    // OAuth URL handling
    getOAuthUrl(provider) {
        // Determine if we're in production (when apiUrl is just a path like "/api")
        const isProduction = !this.baseUrl.includes('://');

        // Build the URL
        if (isProduction) {
            // In production: /api/login/provider
            return `${this.baseUrl}/auth/${provider}`;
        } else {
            // In development: e.g., http://localhost:8000/api/login/provider
            return `${this.baseUrl}/api/auth/${provider}`;
        }
    },

    // Provider-specific OAuth URLs
    getGoogleOAuthUrl() {
        return this.getOAuthUrl('google');
    },

    getGithubOAuthUrl() {
        return this.getOAuthUrl('github');
    },

    getLinkedinOAuthUrl() {
        return this.getOAuthUrl('linkedin');
    },

    // General API request functions
    async get(endpoint, config = {}) {
        return axios.get(`${this.baseUrl}${endpoint}`, config);
    },

    async post(endpoint, data, config = {}) {
        return axios.post(`${this.baseUrl}${endpoint}`, data, config);
    },

    async put(endpoint, data, config = {}) {
        return axios.put(`${this.baseUrl}${endpoint}`, data, config);
    },

    async delete(endpoint, config = {}) {
        return axios.delete(`${this.baseUrl}${endpoint}`, config);
    },

    // Set auth token for subsequent requests
    setAuthToken(token) {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }
};

export default apiService;