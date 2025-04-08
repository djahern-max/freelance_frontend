// src/utils/sessionManager.js

const SESSION_TIMEOUT_KEY = 'session_timeout';
const ACTIVITY_TIMESTAMP_KEY = 'last_activity';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds (adjust as needed)
const WARNING_TIMEOUT = SESSION_TIMEOUT - (2 * 60 * 1000); // 2 minutes before timeout
let warningShown = false;

export const initSessionManager = () => {
    // Set initial activity timestamp
    updateActivityTimestamp();

    // Start activity monitoring
    startActivityMonitoring();

    // Start the session timeout checker
    const intervalId = setInterval(checkSessionTimeout, 60000); // Check every minute

    // Store the interval ID for cleanup
    localStorage.setItem(SESSION_TIMEOUT_KEY, intervalId);

    return () => {
        // Cleanup function
        clearInterval(intervalId);
        stopActivityMonitoring();
    };
};

export const stopSessionManager = () => {
    const intervalId = localStorage.getItem(SESSION_TIMEOUT_KEY);
    if (intervalId) {
        clearInterval(parseInt(intervalId)); // Parse the interval ID from string
        localStorage.removeItem(SESSION_TIMEOUT_KEY);
    }
    stopActivityMonitoring();
    warningShown = false;
};

const updateActivityTimestamp = () => {
    localStorage.setItem(ACTIVITY_TIMESTAMP_KEY, Date.now().toString());
};

const checkSessionTimeout = () => {
    const lastActivity = localStorage.getItem(ACTIVITY_TIMESTAMP_KEY);

    if (!lastActivity) {
        updateActivityTimestamp();
        return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - parseInt(lastActivity);

    // Show warning before session expires
    if (timeSinceLastActivity > WARNING_TIMEOUT && !warningShown) {
        showSessionWarning();
        warningShown = true;
    }

    if (timeSinceLastActivity > SESSION_TIMEOUT) {
        console.log('Session timeout due to inactivity');
        performLogout();
    }
};

const showSessionWarning = () => {
    const remainingTime = Math.ceil((SESSION_TIMEOUT - (Date.now() - parseInt(localStorage.getItem(ACTIVITY_TIMESTAMP_KEY)))) / 60000);

    const userResponse = window.confirm(
        `Your session will expire in approximately ${remainingTime} minute(s) due to inactivity. Click OK to stay logged in.`
    );

    if (userResponse) {
        // User clicked OK, reset the activity timer
        updateActivityTimestamp();
        warningShown = false;
    }
};

// Debounce function to limit how often the activity timestamp is updated
const debounce = (func, delay) => {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// Create a debounced version of updateActivityTimestamp
const debouncedUpdateActivity = debounce(updateActivityTimestamp, 1000);

const startActivityMonitoring = () => {
    // Track user activity
    window.addEventListener('mousemove', debouncedUpdateActivity);
    window.addEventListener('keypress', debouncedUpdateActivity);
    window.addEventListener('click', debouncedUpdateActivity);
    window.addEventListener('scroll', debouncedUpdateActivity);
    window.addEventListener('touchstart', debouncedUpdateActivity);

    // Also update when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            updateActivityTimestamp();
        }
    });
};

const stopActivityMonitoring = () => {
    window.removeEventListener('mousemove', debouncedUpdateActivity);
    window.removeEventListener('keypress', debouncedUpdateActivity);
    window.removeEventListener('click', debouncedUpdateActivity);
    window.removeEventListener('scroll', debouncedUpdateActivity);
    window.removeEventListener('touchstart', debouncedUpdateActivity);
    document.removeEventListener('visibilitychange', updateActivityTimestamp);
};

const performLogout = () => {
    // Clear warning flag
    warningShown = false;

    // Import clearAuthData dynamically to avoid circular dependencies
    import('./authCleanup').then(({ clearAuthData }) => {
        clearAuthData();

        // Show a message to the user
        alert('Your session has expired due to inactivity. Please log in again.');

        // Redirect to login page
        window.location.href = '/login';
    }).catch(error => {
        console.error('Error importing authCleanup:', error);
        // Fallback logout if import fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        window.location.href = '/login';
    });
};

// Expose these functions for testing/debugging if needed
export const _testing = {
    updateActivityTimestamp,
    checkSessionTimeout,
    showSessionWarning
};