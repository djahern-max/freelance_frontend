import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthData } from '../../utils/authCleanup';
import TermsModal from '../shared/TermsModal'; // Import the shared modal component
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

  // Get the Google OAuth URL
  const getGoogleOAuthUrl = () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    // Check if we're in production (when apiUrl is just a path, not a full URL)
    const isProduction = !apiUrl.includes('://');

    if (isProduction) {
      // In production: avoid double /api by removing it from the path
      return `${apiUrl}/login/google`;
    } else {
      // In development: keep the /api prefix
      return `${apiUrl}/api/login/google`;
    }
  };

  // Get the OAuth URL
  const googleLoginUrl = getGoogleOAuthUrl();

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

  // Handle Google registration
  const handleGoogleRegister = () => {
    console.log('Initiating Google registration');
    console.log('Navigating to:', googleLoginUrl);
    window.location.href = googleLoginUrl;
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

        {/* Google Registration Button */}
        <div className={styles.socialLoginContainer}>
          <a
            href={googleLoginUrl}
            className={styles.googleButton}
            onClick={(e) => {
              console.log("Google registration clicked");
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.198-2.701-6.735-2.701-5.523 0-9.996 4.473-9.996 9.996s4.473 9.996 9.996 9.996c8.396 0 10.826-7.883 9.994-11.659h-9.994z"
                fill="#4285F4"
              />
            </svg>
            Register with Google
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