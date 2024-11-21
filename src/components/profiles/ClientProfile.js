import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import UrlInput from '../../components/common/UrlInput'; // Update the import path
import {
  createClientProfile,
  fetchProfile,
  updateClientProfile,
} from '../../redux/profileSlice';
import styles from './DeveloperProfile.module.css';

const DEFAULT_VALUES = {
  company_name: '',
  industry: '',
  company_size: '',
  website: '',
};

const PLACEHOLDERS = {
  company_name: 'Your Company Name',
  industry: 'e.g., Technology, Healthcare',
  company_size: '',
  website: 'https://your-company.com',
};

const COMPANY_SIZES = [
  { value: 'Small', label: '1-50 employees' },
  { value: 'Medium', label: '51-200 employees' },
  { value: 'Large', label: '201-1000 employees' },
  { value: 'Enterprise', label: '1000+ employees' },
];

const ClientProfile = () => {
  const dispatch = useDispatch();
  const {
    data: profile,
    loading,
    error,
  } = useSelector((state) => state.profile);
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWebsiteValid, setIsWebsiteValid] = useState(true);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile?.client_profile) {
      const profileData = profile.client_profile;
      setFormData({
        company_name: profileData.company_name || '',
        industry: profileData.industry || '',
        company_size: profileData.company_size || '',
        website: profileData.website || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isWebsiteValid && formData.website) {
      toast.error('Please enter a valid website URL');
      return;
    }

    setIsSubmitting(true);

    try {
      const action = profile?.client_profile
        ? await dispatch(updateClientProfile(formData))
        : await dispatch(createClientProfile(formData));

      if (action.type.endsWith('/fulfilled')) {
        toast.success(
          profile?.client_profile
            ? 'Profile updated successfully!'
            : 'Profile created successfully!'
        );
      } else {
        toast.error(action.payload || 'Failed to save profile');
      }
    } catch (err) {
      toast.error('Error saving profile');
      console.error('Profile save error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading profile...</div>
      </div>
    );
  }

  const hasProfile = !!profile?.client_profile;

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {hasProfile ? 'Update Your Profile' : 'Create Your Profile'}
          </h2>
          {hasProfile && (
            <div className={styles.profileStatus}>
              <span className={styles.checkmark}>✓</span>
              Profile created on{' '}
              {new Date(profile.client_profile.created_at).toLocaleDateString()}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <div className={styles.errorContent}>
                <span className={styles.errorIcon}>⚠️</span>
                <p className={styles.errorMessage}>{error}</p>
              </div>
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
              placeholder={PLACEHOLDERS.company_name}
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
                placeholder={PLACEHOLDERS.industry}
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
                <option value="">Select size</option>
                {COMPANY_SIZES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <UrlInput
            label="Website"
            value={formData.website}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, website: value }))
            }
            onValidation={setIsWebsiteValid}
            placeholder={PLACEHOLDERS.website}
          />

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className={styles.loadingText}>
                  {hasProfile ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                <span>{hasProfile ? 'Update Profile' : 'Create Profile'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientProfile;
