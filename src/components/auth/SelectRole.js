import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../redux/authSlice';
import axios from 'axios';
import styles from './SelectRole.module.css';

function SelectRole() {
    const [token, setToken] = useState('');
    const [provider, setProvider] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    useEffect(() => {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const tokenParam = params.get('token');
        const providerParam = params.get('provider');

        if (tokenParam) {
            setToken(tokenParam);
            localStorage.setItem('token', tokenParam);
            // Set authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${tokenParam}`;
        }

        if (providerParam) {
            setProvider(providerParam);
        }
    }, [location]);

    const selectRole = async (userType) => {
        try {
            setLoading(true);
            setError('');

            const apiUrl = process.env.REACT_APP_API_URL || '';

            const response = await axios.post(
                `${apiUrl}/auth/select-role`,
                { user_type: userType },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (response.data) {
                // Get updated user info
                const userResponse = await axios.get(
                    `${apiUrl}/auth/me`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                // Update Redux state
                dispatch(
                    login({
                        token: token,
                        user: {
                            ...userResponse.data,
                            userType: userType
                        }
                    })
                );

                // Navigate to appropriate dashboard based on role
                if (userType === 'developer') {
                    navigate('/developer-dashboard');
                } else {
                    navigate('/client-dashboard');
                }
            }
        } catch (err) {
            console.error('Error selecting role:', err);
            setError(`Error: ${err.response?.data?.detail || err.message}. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.roleSelectionPage}>
            <div className={styles.roleSelectionContainer}>
                <h2 className={styles.roleSelectionTitle}>What brings you to RYZE.ai?</h2>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                <div className={styles.roleButtons}>
                    <button
                        onClick={() => selectRole('client')}
                        disabled={loading}
                        className={`${styles.roleButton} ${styles.clientButton}`}
                    >
                        <div className={styles.roleButtonContent}>
                            <span className={styles.roleIcon}>💼</span>
                            <h3>Client</h3>
                            <p>I need software solutions</p>
                        </div>
                    </button>

                    <button
                        onClick={() => selectRole('developer')}
                        disabled={loading}
                        className={`${styles.roleButton} ${styles.developerButton}`}
                    >
                        <div className={styles.roleButtonContent}>
                            <span className={styles.roleIcon}>💻</span>
                            <h3>Developer</h3>
                            <p>I provide development services</p>
                        </div>
                    </button>
                </div>

                {loading && (
                    <div className={styles.loadingContainer}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Processing your selection...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SelectRole;