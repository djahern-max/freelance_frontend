import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, loginFailure, loginStart } from '../../redux/authSlice';
import api from '../../utils/api';
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

  useEffect(() => {
    // Clear any existing auth data on component mount
    clearAuthData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));
    // Clear any existing errors when user starts typing
    if (error) {
      setError('');
      setErrorType('');
    }
  };

  const getDashboardPath = (userType) => {
    if (!userType) {
      console.error('User type is undefined or null');
      return '/login';
    }

    const type = userType.toLowerCase();
    switch (type) {
      case 'client':
        return '/client-dashboard';
      case 'developer':
        return '/developer-dashboard';
      default:
        console.error('Invalid user type:', userType);
        return '/login';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    dispatch(loginStart());

    try {
      // Login request
      const loginUrl = `${process.env.REACT_APP_API_URL}/auth/login`;
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
        credentials: 'include', // Add this if you're using cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      const token = data.access_token;
      if (!token) {
        throw new Error('No token received from server');
      }

      // Store token and update API headers
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Get user data
      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data;

      if (!userData || !userData.user_type) {
        throw new Error('Invalid user data received');
      }

      // Normalize the user data
      const normalizedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.full_name,
        isActive: userData.is_active,
        userType: userData.user_type,
        createdAt: userData.created_at,
      };

      // Update auth state
      dispatch(
        login({
          token,
          user: normalizedUser,
        })
      );

      // Determine redirect path - prioritize stored path or use dashboard
      const dashboardPath = getDashboardPath(normalizedUser.userType);
      const redirectTo = location.state?.from || dashboardPath;

      // Navigate immediately - no need for setTimeout
      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      clearAuthData();

      // Handle specific error cases
      const errorMessage = getErrorMessage(err);
      setError(errorMessage.message);
      setErrorType(errorMessage.type);
      dispatch(loginFailure(errorMessage.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get error message and type
  // Update the getErrorMessage function in your Login.js
  // Update the getErrorMessage function in your Login.js
  const getErrorMessage = (error) => {
    if (!navigator.onLine) {
      return {
        message: 'Unable to connect. Please check your internet connection.',
        type: 'connection',
      };
    }

    if (error.message === 'Failed to fetch') {
      return {
        message: 'Server connection failed. Please try again in a moment.',
        type: 'connection',
      };
    }

    // Check for specific authentication errors
    if (
      error.message.includes('Invalid credentials') ||
      error.message.includes('Invalid username or password')
    ) {
      return {
        message: 'The username or password you entered is incorrect.',
        type: 'auth',
      };
    }

    if (error.message.includes('User not found')) {
      return {
        message: 'No account found with this username. Need an account?',
        type: 'auth',
      };
    }

    if (
      error.message.includes('Account disabled') ||
      error.message.includes('Account inactive')
    ) {
      return {
        message: 'This account has been deactivated. Please contact support.',
        type: 'auth',
      };
    }

    // For rate limiting or too many attempts
    if (error.message.includes('Too many attempts')) {
      return {
        message: 'Too many login attempts. Please try again in a few minutes.',
        type: 'validation',
      };
    }

    return {
      message: 'Sign in failed. Please check your details and try again.',
      type: 'general',
    };
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
