// src/components/auth/OAuthSuccess.js
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import apiService from '../../utils/apiService';
import { login } from '../../redux/authSlice';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
            console.error('No token found in OAuth success redirect');
            navigate('/login');
            return;
        }

        // Set the token in local storage and apiService
        apiService.setAuthToken(token);

        // Fetch user data and login
        const fetchUserData = async () => {
            try {
                // Fetch current user data
                const response = await apiService.get('/auth/me');
                const userData = response.data;

                // Dispatch login action with user data and token
                dispatch(login({ token, user: userData }));

                // Check if user needs to select a role
                if (userData.needs_role_selection) {
                    navigate('/select-role'); // Changed from '/api/auth/select-role'
                } else {
                    // Redirect to appropriate dashboard based on user type
                    if (userData.user_type === 'developer') {
                        navigate('/developer-dashboard'); // Changed to match App.js routes
                    } else if (userData.user_type === 'client') {
                        navigate('/client-dashboard'); // Changed to match App.js routes
                    } else {
                        navigate('/dashboard'); // Default dashboard
                    }
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                navigate('/login');
            }
        };

        fetchUserData();
    }, [dispatch, navigate, location]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto mb-4 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
                <h2 className="mb-2 text-2xl font-bold">Authentication Successful</h2>
                <p className="text-gray-600">Redirecting you to your account...</p>
            </div>
        </div>
    );
};

export default OAuthSuccess;