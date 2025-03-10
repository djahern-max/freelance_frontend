import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login, loginFailure, loginStart } from '../../redux/authSlice';
import axios from 'axios';
import { clearAuthData } from '../../utils/authCleanup';
import { debugOAuthConnection, OAuthDebugPanel } from '../../utils/oauthDebug';
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

  const getOAuthUrl = (provider) => {
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const isProduction = apiUrl && !apiUrl.startsWith('http');

    return isProduction ? `${apiUrl}/auth/${provider}` : `${apiUrl}/api/auth/${provider}`;
  };

  const googleLoginUrl = getOAuthUrl('google');
  const githubLoginUrl = getOAuthUrl('github');
  const linkedinLoginUrl = getOAuthUrl('linkedin');

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("OAuth URLs:", {
        google: googleLoginUrl,
        github: githubLoginUrl,
        linkedin: linkedinLoginUrl
      });
    }
    clearAuthData();
  }, [googleLoginUrl, githubLoginUrl, linkedinLoginUrl]);

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

  const handleOAuthClick = (provider, url) => {
    if (process.env.NODE_ENV === 'development') {
      debugOAuthConnection(provider, url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    dispatch(loginStart());

    try {
      const loginUrl = `${process.env.REACT_APP_API_URL}/auth/login`;
      const response = await axios.post(loginUrl, formData);
      const data = response.data;
      const token = data.access_token;

      if (!token) throw new Error('No token received from server');

      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userResponse = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const userData = userResponse.data;
      if (!userData || !userData.user_type) throw new Error('Invalid user data received');

      const normalizedUser = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.full_name,
        isActive: userData.is_active,
        userType: userData.user_type,
        createdAt: userData.created_at,
      };

      dispatch(login({ token, user: normalizedUser }));

      const dashboardPath = getDashboardPath(normalizedUser.userType);
      const redirectTo = location.state?.from || dashboardPath;

      navigate(redirectTo, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
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

        {/* OAuth login options */}
        <div className={styles.socialLoginContainer}>
          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <a href={googleLoginUrl} className={`${styles.oauthButton} ${styles.googleButton}`} onClick={() => handleOAuthClick('google', googleLoginUrl)}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.701-6.735-2.701-5.523 0-9.996 4.473-9.996 9.996s4.473 9.996 9.996 9.996c8.396 0 10.826-7.883 9.994-11.659h-9.994z"
                fill="#4285F4"
              />
            </svg>
            Continue with Google
          </a>

          <a href={githubLoginUrl} className={`${styles.oauthButton} ${styles.githubButton}`} onClick={() => handleOAuthClick('github', githubLoginUrl)}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="#24292e"
              />
            </svg>
            Continue with GitHub
          </a>

          <a href={linkedinLoginUrl} className={`${styles.oauthButton} ${styles.linkedinButton}`} onClick={() => handleOAuthClick('linkedin', linkedinLoginUrl)}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                fill="#0077B5"
              />
            </svg>
            Continue with LinkedIn
          </a>
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

      {process.env.NODE_ENV === 'development' && (
        <OAuthDebugPanel
          googleUrl={googleLoginUrl}
          githubUrl={githubLoginUrl}
          linkedinUrl={linkedinLoginUrl}
        />
      )}
    </div>
  );
};

export default Login;