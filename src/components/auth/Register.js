import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthData } from '../../utils/authCleanup';
import TermsModal from '../shared/TermsModal';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'client',
    full_name: '',
    termsAccepted: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  // Function to get OAuth URL for any provider
  const getOAuthUrl = (provider) => {
    const apiUrl = process.env.REACT_APP_API_URL;
    // Check if we're in production (when apiUrl is just a path, not a full URL)
    const isProduction = !apiUrl.includes('://');

    if (isProduction) {
      // In production: avoid double /api by removing it from the path
      return `${apiUrl}/login/${provider}`;
    } else {
      // In development: keep the /api prefix
      return `${apiUrl}/api/login/${provider}`;
    }
  };

  // Get OAuth URLs for all providers
  const googleLoginUrl = getOAuthUrl('google');
  const githubLoginUrl = getOAuthUrl('github');
  const linkedinLoginUrl = getOAuthUrl('linkedin');

  // Cleanup stale auth data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      clearAuthData();
    }
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle OAuth registration
  const handleOAuthRegister = (provider, url) => {
    console.log(`Initiating ${provider} registration`);
    console.log('Navigating to:', url);
    window.location.href = url;
  };

  // Handle registration logic
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.termsAccepted) {
      setError('You must accept the Terms and Conditions to register.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const requestBody = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        user_type: formData.userType,
        full_name: formData.full_name,
        terms_accepted: formData.termsAccepted,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      navigate('/login', {
        state: {
          from,
          registrationSuccess: true,
          message:
            'Account created successfully! You can complete your profile after logging in.',
        },
      });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create Account</h1>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {/* OAuth Buttons */}
        <div className={styles.socialLoginContainer}>
          {/* Google Button */}
          <a
            href={googleLoginUrl}
            className={styles.oauthButton}
            onClick={() => console.log("Google registration clicked")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className={styles.googleIcon}>
              <path
                d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.701-6.735-2.701-5.523 0-9.996 4.473-9.996 9.996s4.473 9.996 9.996 9.996c8.396 0 10.826-7.883 9.994-11.659h-9.994z"
                fill="#4285F4"
              />
            </svg>
            Register with Google
          </a>

          {/* GitHub Button */}
          <a
            href={githubLoginUrl}
            className={`${styles.oauthButton} ${styles.githubButton}`}
            onClick={() => console.log("GitHub registration clicked")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className={styles.githubIcon}>
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                fill="#24292e"
              />
            </svg>
            Register with GitHub
          </a>

          {/* LinkedIn Button */}
          <a
            href={linkedinLoginUrl}
            className={`${styles.oauthButton} ${styles.linkedinButton}`}
            onClick={() => console.log("LinkedIn registration clicked")}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" className={styles.linkedinIcon}>
              <path
                d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
                fill="#0077B5"
              />
            </svg>
            Register with LinkedIn
          </a>

          <div className={styles.divider}>
            <span>OR</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="userType">I am a:</label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className={styles.select}
            >
              <option value="client">CLIENT seeking solutions</option>
              <option value="developer">CREATOR providing answers</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              className={styles.input}
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className={styles.input}
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              required
              className={styles.input}
              autoComplete="name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className={styles.input}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className={styles.input}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.termsGroup}>
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              className={styles.checkbox}
            />
            <label htmlFor="termsAccepted" className={styles.termsLabel}>
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(true)}
                className={styles.termsLink}
              >
                Terms and Conditions
              </button>
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link to="/login" className={styles.link} state={{ from }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Use shared TermsModal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </div>
  );
};

export default Register;