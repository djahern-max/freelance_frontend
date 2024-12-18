import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createClientProfile, // Add this import
  fetchClientProfile,
  selectError,
  selectIsInitialized,
  selectLoading,
  selectProfile,
  updateClientProfile, // Add this import
} from '../../redux/profileSlice';
import styles from './ClientProfile.module.css';

const DEFAULT_VALUES = {
  company_name: '',
  industry: '',
  company_size: '',
  website: '',
};

const COMPANY_SIZES = [
  { value: 'Small', label: '1-50 employees' },
  { value: 'Medium', label: '51-200 employees' },
  { value: 'Large', label: '201-1000 employees' },
  { value: 'Enterprise', label: '1000+ employees' },
];

const ClientProfile = () => {
  const dispatch = useDispatch();
  const profile = useSelector(selectProfile);
  const isInitialized = useSelector(selectIsInitialized);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchClientProfile())
      .unwrap()
      .then((data) => {
        if (data) {
          setFormData({
            company_name: data.company_name || '',
            industry: data.industry || '',
            company_size: data.company_size || '',
            website: data.website || '',
          });
        } else {
          setFormData(DEFAULT_VALUES);
        }
      })
      .catch((err) => {
        if (err !== 'The requested resource was not found.') {
          console.error('Error fetching client profile:', err);
          toast.error('Error loading profile', {
            className: 'custom-toast custom-toast-error',
          });
        }
        setFormData(DEFAULT_VALUES);
      });
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // If profile exists, update it; otherwise, create it
      const action = profile ? updateClientProfile : createClientProfile;
      await dispatch(action(formData)).unwrap();

      toast.success(
        profile
          ? 'Profile updated successfully!'
          : 'Profile created successfully!',
        {
          className: 'custom-toast custom-toast-success',
        }
      );

      // Refresh profile data
      dispatch(fetchClientProfile());
    } catch (err) {
      toast.error(err || 'Error saving profile', {
        className: 'custom-toast custom-toast-error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && !isInitialized) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create Your Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && error !== 'The requested resource was not found.' && (
            <div className={styles.error}>
              <div className={styles.errorContent}>
                <span className={styles.errorIcon}>⚠️</span>
                <p className={styles.errorMessage}>{error}</p>
              </div>
            </div>
          )}

          {(!profile || error === 'The requested resource was not found.') && (
            <div className={styles.infoMessage}>
              <p>Welcome! Please create your client profile to get started.</p>
            </div>
          )}

          <div className={styles.formGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>Company Name</label>
              <span className={styles.required}>*</span>
            </div>
            <input
              type="text"
              className={styles.input}
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              required
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label className={styles.label}>Industry</label>
                <span className={styles.required}>*</span>
              </div>
              <input
                type="text"
                className={styles.input}
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label className={styles.label}>Company Size</label>
                <span className={styles.required}>*</span>
              </div>
              <select
                className={styles.select}
                value={formData.company_size}
                onChange={(e) =>
                  setFormData({ ...formData, company_size: e.target.value })
                }
                required
              >
                <option value="">Select size...</option>
                {COMPANY_SIZES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>Website</label>
            </div>
            <input
              type="url"
              className={styles.input}
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              placeholder="https://example.com"
            />
            <span className={styles.helpText}>
              Enter your company's website URL
            </span>
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.loadingText}>
                  {profile ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                <span>{profile ? 'Update Profile' : 'Create Profile'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientProfile;
