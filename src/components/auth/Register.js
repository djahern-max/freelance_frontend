// src/components/auth/Register.js
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthData } from '../../utils/authCleanup';
import TermsModal from '../shared/TermsModal';
import styles from './Register.module.css';
import OAuthButtons from './OAuthButtons';

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

      console.log('Sending registration data:', requestBody);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      // In your handleRegister function, replace the "if (!response.ok)" block with this:

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Registration failed:', errorData);

        // Direct error handling for common error messages
        if (errorData.detail === 'Email already registered') {
          throw new Error('This email is already registered. Please use a different email or try logging in.');
        }

        if (errorData.detail === 'Username already taken') {
          throw new Error('This username is already taken. Please choose a different username.');
        }

        if (errorData.detail && typeof errorData.detail === 'string') {
          throw new Error(errorData.detail);
        }

        // For more complex validation errors
        if (Array.isArray(errorData.detail)) {
          const errorMessage = errorData.detail.map(err => {
            if (err.loc && err.loc.length > 1) {
              const field = err.loc[1];
              return `${field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}: ${err.msg}`;
            }
            return err.msg;
          }).join('\n');

          throw new Error(errorMessage);
        }

        // Fallback error message
        throw new Error('Registration failed. Please check your information and try again.');
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
      // Display a user-friendly error message
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

        {error && (
          <div className={styles.error}>
            {error.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}
        {/* OAuth Buttons Section */}
        <div className={styles.socialLoginContainer}>
          <OAuthButtons buttonText="Register with" />

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