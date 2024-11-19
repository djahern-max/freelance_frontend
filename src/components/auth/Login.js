import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, loginFailure, loginStart } from '../../redux/authSlice';
import api from '../../utils/api'; // Use your API client instead of axios directly
import { clearAuthData } from '../../utils/authCleanup';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Clear any existing auth data on mount
  useEffect(() => {
    clearAuthData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    dispatch(loginStart());

    try {
      // First, check if we can reach the server at all
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: formData.username,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid username or password');
        } else if (response.status === 422) {
          throw new Error('Invalid input format');
        } else {
          throw new Error(data.detail || 'Server error');
        }
      }

      const token = data.access_token;
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token immediately
      localStorage.setItem('token', token);

      // Update API client headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Step 2: Get user info
      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data;

      // Dispatch login success with complete user data
      dispatch(
        login({
          token,
          user: userData,
        })
      );

      // Determine redirect path
      const redirectTo =
        location.state?.from ||
        (userData.user_type === 'client'
          ? '/client-dashboard'
          : '/developer-dashboard');

      // Navigate to appropriate dashboard
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Login error:', err);

      clearAuthData();

      if (err.message === 'Failed to fetch' || !window.navigator.onLine) {
        setError(
          'Unable to connect to server. Please check your internet connection.'
        );
        setErrorType('connection');
      } else if (err.message === 'Invalid username or password') {
        setError('Invalid username or password');
        setErrorType('auth');
      } else if (err.message === 'Invalid input format') {
        setError('Please check your input and try again');
        setErrorType('validation');
      } else {
        setError('An unexpected error occurred. Please try again.');
        setErrorType('general');
      }

      dispatch(loginFailure(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
    // Clear both error and errorType when user starts typing
    if (error) {
      setError('');
      setErrorType('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {error && (
          <div className={`${styles.error} ${styles[errorType]}`}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>
                {errorType === 'connection' && '🌐'}
                {errorType === 'auth' && '🔒'}
                {errorType === 'validation' && '⚠️'}
                {errorType === 'general' && '❌'}
              </div>
              <p className={styles.errorMessage}>{error}</p>
              <button
                className={styles.dismissError}
                onClick={() => {
                  setError('');
                  setErrorType('');
                }}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="username"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.input}
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={styles.loadingText}>Signing in...</span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Don't have an account?{' '}
            <Link to="/register" className={styles.link}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
