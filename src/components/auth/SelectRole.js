import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../utils/api';
import { login } from '../../redux/authSlice';
import styles from './SelectRole.module.css';

// SVG Icons (inline for simplicity)
const DeveloperIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 18L3 12L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 6L21 12L16 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 20L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClientIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const SelectRole = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        // Extract token from URL
        const params = new URLSearchParams(location.search);
        const urlToken = params.get('token');

        if (!urlToken) {
            setError('Authentication token is missing. Please try logging in again.');
            return;
        }

        // Store token
        setToken(urlToken);
        localStorage.setItem('token', urlToken);

        // We don't need to fetch user data here since we'll handle everything
        // during role selection - the user is already authenticated with a token
    }, [location.search]);

    const handleRoleSelection = async (userType) => {
        setLoading(true);
        try {
            if (!token) {
                setError('Your session has expired. Please log in again.');
                return;
            }

            // Send role selection to backend
            const response = await api.post('/auth/select-role',
                {
                    user_type: userType // This endpoint will get current_user from JWT token
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data) {
                // Fetch user data to get updated information
                const userResponse = await api.get('/auth/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!userResponse.data) {
                    throw new Error('Failed to retrieve user data');
                }

                // Update Redux store
                dispatch(login({
                    token,
                    user: {
                        id: userResponse.data.id,
                        username: userResponse.data.username,
                        email: userResponse.data.email,
                        fullName: userResponse.data.full_name || '',
                        isActive: userResponse.data.is_active,
                        userType: userType, // Use the selected role
                        createdAt: userResponse.data.created_at,
                    },
                }));

                // Redirect to appropriate dashboard
                const dashboardPath = userType === 'client' ? '/client-dashboard' : '/developer-dashboard';
                navigate(dashboardPath);
            }
        } catch (err) {
            console.error('Error setting role:', err);
            setError('Failed to set your role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles["select-role-container"]}>
            <div className={styles["select-role-card"]}>
                <h2>Choose Your Role</h2>
                <p>Select a role to personalize your experience on RYZE.ai</p>

                <div className={styles["role-options"]}>
                    <button
                        className={`${styles["role-option"]} ${styles["developer"]}`}
                        onClick={() => handleRoleSelection('developer')}
                        disabled={loading}
                    >
                        <div className={styles["role-icon-container"]}>
                            <span className={styles["role-icon"]}><DeveloperIcon /></span>
                        </div>
                        <h3>Developer</h3>
                        <p>I provide software development services</p>
                    </button>

                    <button
                        className={`${styles["role-option"]} ${styles["client"]}`}
                        onClick={() => handleRoleSelection('client')}
                        disabled={loading}
                    >
                        <div className={styles["role-icon-container"]}>
                            <span className={styles["role-icon"]}><ClientIcon /></span>
                        </div>
                        <h3>Client</h3>
                        <p>I'm looking to hire developers</p>
                    </button>
                </div>

                {error && <div className={styles["error-message"]}>{error}</div>}

                {loading && <div className={styles["loading"]}>Processing your selection...</div>}
            </div>
        </div>
    );
};

export default SelectRole;