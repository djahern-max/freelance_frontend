// Modified Register.js
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clearAuthData } from '../../utils/authCleanup';
import TermsModal from '../shared/TermsModal';
import styles from './Register.module.css';
import OAuthButtons from './OAuthButtons';
import formValidation from '../../utils/formValidation';
import apiService from '../../utils/apiService';

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

  // Track field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    termsAccepted: '',
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});

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

  // Validate a specific field
  const validateField = (name, value) => {
    if (formValidation[name]) {
      // For confirmPassword, pass password value as well
      if (name === 'confirmPassword') {
        return formValidation[name].validate(value, { password: formData.password });
      }
      return formValidation[name].validate(value);
    }
    return null;
  };

  // Validate all fields and return whether form is valid
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Validate each field
    Object.keys(formValidation).forEach(field => {
      if (field === 'confirmPassword') {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      } else if (formData[field] !== undefined) {
        const error = validateField(field, formData[field]);
        if (error) {
          errors[field] = error;
          isValid = false;
        }
      }
    });

    setFieldErrors(errors);
    return isValid;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on change if the field has been touched
    if (touchedFields[name]) {
      const error = validateField(name, newValue);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field
    const error = validateField(name, fieldValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error || ''
    }));
  };

  // Handle registration logic
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Run full validation
    if (!validateForm()) {
      // Form has errors
      return;
    }

    setIsLoading(true);

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

      const response = await apiService.post('/auth/register', requestBody);

      // Handle success
      navigate('/login', {
        state: {
          from,
          registrationSuccess: true,
          message:
            'Account created successfully! You can complete your profile after logging in.',
        },
      });
    } catch (err) {
      console.error('Registration error:', err);

      // Handle specific error cases
      if (err.response && err.response.data) {
        const errorData = err.response.data;

        if (errorData.detail === 'Email already registered') {
          setFieldErrors(prev => ({
            ...prev,
            email: 'This email is already registered. Please use a different email or try logging in.'
          }));
        } else if (errorData.detail === 'Username already taken') {
          setFieldErrors(prev => ({
            ...prev,
            username: 'This username is already taken. Please choose a different username.'
          }));
        } else if (errorData.detail && typeof errorData.detail === 'string') {
          setError(errorData.detail);
        } else if (Array.isArray(errorData.detail)) {
          // Handle validation errors from FastAPI
          const newFieldErrors = { ...fieldErrors };

          errorData.detail.forEach(err => {
            if (err.loc && err.loc.length > 1) {
              const field = err.loc[1];
              // Map backend field names to frontend field names if needed
              const mappedField = field === 'full_name' ? 'full_name' : field;
              if (newFieldErrors.hasOwnProperty(mappedField)) {
                newFieldErrors[mappedField] = err.msg;
              } else {
                // If no matching field, set as general error
                setError(prev => prev ? `${prev}\n${err.msg}` : err.msg);
              }
            } else {
              setError(prev => prev ? `${prev}\n${err.msg}` : err.msg);
            }
          });

          setFieldErrors(newFieldErrors);
        } else {
          setError('Registration failed. Please check your information and try again.');
        }
      } else {
        setError(err.message || 'Registration failed. Please try again later.');
      }
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
              onBlur={handleBlur}
              required
              className={`${styles.input} ${fieldErrors.username ? styles.inputError : ''}`}
              autoComplete="username"
            />
            {fieldErrors.username && (
              <div className={styles.fieldError}>{fieldErrors.username}</div>
            )}
            <div className={styles.fieldHint}>
              Letters, numbers, underscores and hyphens only (no spaces)
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={`${styles.input} ${fieldErrors.email ? styles.inputError : ''}`}
              autoComplete="email"
            />
            {fieldErrors.email && (
              <div className={styles.fieldError}>{fieldErrors.email}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={`${styles.input} ${fieldErrors.full_name ? styles.inputError : ''}`}
              autoComplete="name"
            />
            {fieldErrors.full_name && (
              <div className={styles.fieldError}>{fieldErrors.full_name}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={`${styles.input} ${fieldErrors.password ? styles.inputError : ''}`}
              autoComplete="new-password"
            />
            {fieldErrors.password && (
              <div className={styles.fieldError}>{fieldErrors.password}</div>
            )}
            <div className={styles.fieldHint}>
              At least 8 characters
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
              autoComplete="new-password"
            />
            {fieldErrors.confirmPassword && (
              <div className={styles.fieldError}>{fieldErrors.confirmPassword}</div>
            )}
          </div>

          <div className={styles.termsGroup}>
            <input
              type="checkbox"
              id="termsAccepted"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleInputChange}
              onBlur={handleBlur}
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
          {fieldErrors.termsAccepted && (
            <div className={styles.fieldError}>{fieldErrors.termsAccepted}</div>
          )}

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