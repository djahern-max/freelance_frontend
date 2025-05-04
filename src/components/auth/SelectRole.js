
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import api from '../../utils/api';
import { login } from '../../redux/authSlice';
import styles from './SelectRole.module.css';

// SVG Icons (inline for simplicity)
const RocketIcon = () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const VideoIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="23 7 16 12 23 17 23 7" fill="currentColor" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const SelectRole = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState('');
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

        // Store token AND set it in the API utility
        setToken(urlToken);
        localStorage.setItem('token', urlToken);
        api.setToken(urlToken);
    }, [location.search]);

    const handleRoleSelection = async (userType) => {
        setLoading(true);
        try {
            if (!token) {
                setError('Your session has expired. Please log in again.');
                return;
            }

            // Set the token in the api utility
            api.setToken(token);

            // Make the API call
            const response = await api.post('/auth/select-role', {
                user_type: userType
            });

            if (response.data) {
                // Get user data
                const userResponse = await api.get('/auth/me');

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
                        userType: userType,
                        createdAt: userResponse.data.created_at,
                    },
                }));

                // Redirect to client dashboard
                navigate('/client-dashboard');
            }
        } catch (err) {
            console.error('Error setting role:', err);
            setError(`Failed to set your role: ${err.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles["select-role-container"]}>
            <div className={styles["select-role-card"]}>
                <h2>Welcome Aboard! 🚀</h2>
                <p className={styles["main-description"]}>
                    You've joined a platform where your development needs are handled efficiently and transparently.
                </p>

                <div className={styles["features-grid"]}>
                    <div className={styles["feature-item"]}>
                        <div className={styles["feature-icon"]}>
                            <ClockIcon />
                        </div>
                        <h4>1-Hour Response Time</h4>
                        <p>I commit to responding to all project requests within one hour</p>
                    </div>

                    <div className={styles["feature-item"]}>
                        <div className={styles["feature-icon"]}>
                            <VideoIcon />
                        </div>
                        <h4>Video Tutorials</h4>
                        <p>Learn how to use the platform efficiently with guided tutorials</p>
                        <a href="#" className={styles["coming-soon"]}>Coming Soon</a>
                    </div>

                    <div className={styles["feature-item"]}>
                        <div className={styles["feature-icon"]}>
                            <CalendarIcon />
                        </div>
                        <h4>Easy Scheduling</h4>
                        <p>Book consultations directly through integrated Cal.com</p>
                        <a href="#" className={styles["coming-soon"]}>Coming Soon</a>
                    </div>
                </div>

                <div className={styles["role-options"]}>
                    <button
                        className={`${styles["role-option"]} ${styles["client"]}`}
                        onClick={() => handleRoleSelection('client')}
                        disabled={loading}
                    >
                        <div className={styles["role-icon-container"]}>
                            <span className={styles["role-icon"]}><RocketIcon /></span>
                        </div>
                        <h3>Get Started</h3>
                        <p>Submit development requests and track your projects</p>
                    </button>
                </div>

                {error && <div className={styles["error-message"]}>{error}</div>}
                {loading && <div className={styles["loading"]}>Setting up your dashboard...</div>}

                <p className={styles["platform-info"]}>
                    This platform allows you to submit development requests directly, track progress in real-time,
                    and communicate effectively throughout your project lifecycle.
                </p>
            </div>
        </div>
    );
};

export default SelectRole;
