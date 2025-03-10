// src/components/auth/OAuthCallback.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extract all URL parameters
        const params = new URLSearchParams(location.search);

        // Look for OAuth provider IDs and tokens
        const googleId = params.get('google_id');
        const githubId = params.get('github_id');
        const linkedinId = params.get('linkedin_id');
        const token = params.get('token'); // JWT token if your backend provides one
        const error = params.get('error');

        // Handle errors
        if (error) {
            console.error('OAuth error:', error);
            navigate('/oauth-error');
            return;
        }

        // Store OAuth information
        if (googleId) localStorage.setItem('google_id', googleId);
        if (githubId) localStorage.setItem('github_id', githubId);
        if (linkedinId) localStorage.setItem('linkedin_id', linkedinId);
        if (token) localStorage.setItem('token', token);

        // Navigate to success page which will handle user data fetching
        navigate('/oauth-success');
    }, [navigate, location]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold mb-2">Processing Authentication</h2>
                <p className="text-gray-600">Please wait while we verify your account...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;