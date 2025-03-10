// src/components/auth/SelectRole.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import apiService from '../../utils/apiService';
import { updateUserType, login } from '../../redux/authSlice';
import styles from './SelectRole.module.css';

const SelectRole = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.auth);

    // Get OAuth IDs from localStorage
    const googleId = localStorage.getItem('google_id');
    const githubId = localStorage.getItem('github_id');
    const linkedinId = localStorage.getItem('linkedin_id');

    // Get token from URL query params if available
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const urlToken = queryParams.get('token');

        if (urlToken) {
            console.log('Token found in URL');
            localStorage.setItem('token', urlToken);
            if (apiService.setAuthToken) {
                apiService.setAuthToken(urlToken);
            }
        }
    }, [location]);

    // Try to fetch user data if needed
    useEffect(() => {
        const fetchUserData = async () => {
            if (!user && (googleId || githubId || linkedinId)) {
                try {
                    console.log('Fetching user data with OAuth IDs');
                    const response = await apiService.get('/auth/get-user', {
                        params: {
                            google_id: googleId,
                            github_id: githubId,
                            linkedin_id: linkedinId
                        }
                    });

                    if (response.data) {
                        dispatch(
                            login({
                                user: {
                                    id: response.data.id,
                                    username: response.data.username,
                                    email: response.data.email,
                                    fullName: response.data.full_name,
                                    isActive: response.data.is_active,
                                    userType: response.data.user_type,
                                    createdAt: response.data.created_at,
                                },
                            })
                        );
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
    }, [user, googleId, githubId, linkedinId, dispatch]);

    const handleRoleSelection = async () => {
        if (!selectedRole) {
            setError('Please select a role to continue');
            return;
        }

        setLoading(true);
        setError('');

        try {
            console.log('Submitting role selection with OAuth IDs');
            // Check which OAuth identifiers we have
            if (!googleId && !githubId && !linkedinId) {
                setError('Unable to identify your account. Please try logging in again.');
                setLoading(false);
                return;
            }

            // Make the API call with OAuth identifiers
            const response = await apiService.post('/auth/set-role', {
                email: user?.email,
                user_type: selectedRole,
                google_id: googleId,
                github_id: githubId,
                linkedin_id: linkedinId
            });

            console.log('Role selection response:', response);

            // Update Redux store with the new user type
            dispatch(updateUserType(selectedRole));

            // Navigate to appropriate dashboard
            if (selectedRole === 'developer') {
                navigate('/developer-dashboard');
            } else {
                navigate('/client-dashboard');
            }
        } catch (err) {
            console.error('Error setting user role:', err);
            setError('Failed to set role. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h2 className={styles.title}>Choose Your Role</h2>
                <p className={styles.description}>
                    Select a role to personalize your experience on RYZE.ai
                </p>

                <div className={styles.roleOptions}>
                    <div
                        className={`${styles.roleOption} ${selectedRole === 'developer' ? styles.selected : ''}`}
                        onClick={() => setSelectedRole('developer')}
                    >
                        <div className={styles.roleIcon}>💻</div>
                        <h3>Developer</h3>
                        <p>I provide software development services</p>
                    </div>

                    <div
                        className={`${styles.roleOption} ${selectedRole === 'client' ? styles.selected : ''}`}
                        onClick={() => setSelectedRole('client')}
                    >
                        <div className={styles.roleIcon}>🏢</div>
                        <h3>Client</h3>
                        <p>I'm looking to hire developers</p>
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    className={styles.continueButton}
                    onClick={handleRoleSelection}
                    disabled={loading || !selectedRole}
                >
                    {loading ? 'Processing...' : 'Continue'}
                </button>

                {/* Debug information - can be removed in production */}
                {process.env.NODE_ENV === 'development' && (
                    <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                        <p>Debug: {googleId ? `Google ID: ${googleId.substring(0, 5)}...` : 'No Google ID'}</p>
                        <p>Debug: {githubId ? `GitHub ID: ${githubId.substring(0, 5)}...` : 'No GitHub ID'}</p>
                        <p>Debug: {linkedinId ? `LinkedIn ID: ${linkedinId.substring(0, 5)}...` : 'No LinkedIn ID'}</p>
                        <p>Debug: {user ? `User Email: ${user.email}` : 'No User in Redux'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectRole;