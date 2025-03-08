import axios from 'axios';

/**
 * Service for managing API endpoints and URL construction
 * This centralizes API URL logic for consistency across the application
 */
class ApiService {
    constructor() {
        this.baseUrl = process.env.REACT_APP_API_URL || '';

        // Determine if we're in production based on URL format
        // In production, the API URL might be just '/api' without protocol/domain
        this.isProduction = !this.baseUrl.includes('://');

        // Create configured axios instance
        this.api = axios.create({
            baseURL: this.isProduction ? this.baseUrl : `${this.baseUrl}/api`,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            this.setAuthToken(token);
        }

        // Log configuration in development
        if (process.env.NODE_ENV === 'development') {
            console.log('API Service initialized with:', {
                baseUrl: this.baseUrl,
                isProduction: this.isProduction,
                effectiveBaseUrl: this.isProduction ? this.baseUrl : `${this.baseUrl}/api`,
            });
        }
    }

    /**
     * Sets the authorization token for subsequent requests
     * @param {string} token - The JWT auth token
     */
    setAuthToken(token) {
        if (token) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.api.defaults.headers.common['Authorization'];
            delete axios.defaults.headers.common['Authorization'];
        }
    }

    /**
     * Removes the authorization token
     */
    clearAuthToken() {
        delete this.api.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['Authorization'];
        localStorage.removeItem('token');
    }

    /**
     * Constructs a full API URL based on the environment
     * @param {string} endpoint - The API endpoint path
     * @returns {string} The complete URL
     */
    getApiUrl(endpoint) {
        // Remove leading slash if present
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

        // In production, the base URL might already include /api
        if (this.isProduction) {
            return `${this.baseUrl}/${cleanEndpoint}`;
        } else {
            // In development, we need to ensure /api is in the path
            return `${this.baseUrl}/api/${cleanEndpoint}`;
        }
    }

    /**
     * Gets the OAuth login URL
     * @returns {string} The OAuth URL
     */
    getGoogleOAuthUrl() {
        return this.getApiUrl('login/google');
    }

    /**
     * Completes OAuth registration with user role
     * @param {string} tempToken - The temporary OAuth token
     * @param {string} userType - The selected user type (client/developer)
     * @returns {Promise} The API response
     */
    async completeOAuthRegistration(tempToken, userType) {
        return await this.api.post('/complete-oauth-registration', {
            temp_token: tempToken,
            user_type: userType
        });
    }

    /**
     * Gets current user info
     * @returns {Promise} The API response with user data
     */
    async getCurrentUser() {
        return await this.api.get('/auth/me');
    }

    /**
     * Authenticates user with username/password
     * @param {Object} credentials - The login credentials
     * @returns {Promise} The API response
     */
    async login(credentials) {
        return await this.api.post('/auth/login', credentials);
    }

    /**
     * Registers a new user
     * @param {Object} userData - The user registration data
     * @returns {Promise} The API response
     */
    async register(userData) {
        return await this.api.post('/auth/register', userData);
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;