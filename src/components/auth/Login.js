// src/components/auth/Login.js
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, loginFailure, loginStart } from '../../redux/authSlice';
import axios from 'axios';
import { clearAuthData } from '../../utils/authCleanup';
import styles from './Login.module.css';
import OAuthButtons from './OAuthButtons';


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

  // Clear any existing auth data on component mount
  useEffect(() => {
    clearAuthData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value.trim(),
    }));

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
      // Update the URL to avoid the double /api/ issue
      const loginUrl = `${process.env.REACT_APP_API_URL}/api/auth/login`;
      console.log("DEBUG: Attempting login at:", loginUrl);

      const response = await axios.post(loginUrl, formData);
      const data = response.data;
      const token = data.access_token;

      if (!token) throw new Error('No token received from server');

      // Store token
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      console.log("DEBUG: Token received, about to call /auth/me");

      // Make request to /auth/me - ensure correct URL is used here too
      const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("DEBUG: /auth/me response received", userResponse.data);

      const userData = userResponse.data;
      if (!userData || !userData.user_type) throw new Error('Invalid user data received');

      // Normalize user data
      const normalizedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.full_name,
        isActive: userData.is_active,
        userType: userData.user_type,
        createdAt: userData.created_at,
      };

      // Update Redux state
      dispatch(login({ token, user: normalizedUser }));

      // Redirect to dashboard
      const dashboardPath = getDashboardPath(normalizedUser.userType);
      const redirectTo = location.state?.from || dashboardPath;

      navigate(redirectTo, { replace: true });

    } catch (err) {
      console.error('DEBUG: Login error:', err);
      clearAuthData();

      const errorMessage = getErrorMessage(err);
      setError(errorMessage.message);
      setErrorType(errorMessage.type);
      dispatch(loginFailure(errorMessage.message));
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (!navigator.onLine) {
      return { message: 'Please check your internet connection.', type: 'connection' };
    }

    if (error.response) {
      const { data, status } = error.response;
      if (data && data.detail) {
        return { message: data.detail, type: 'auth' };
      }
      if (status === 429) {
        return { message: 'Too many login attempts. Try again later.', type: 'validation' };
      }
    }

    return { message: 'Sign in failed. Please try again.', type: 'general' };
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome</h1>
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

        {/* Use standardized OAuth buttons component */}
        <div className={styles.socialLoginContainer}>
          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <OAuthButtons buttonText="Sign in with" />
        </div>

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