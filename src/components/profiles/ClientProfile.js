import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import styles from './ClientProfile.module.css';

const ClientProfile = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    company_size: '',
    website: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileExists, setProfileExists] = useState(false);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/profile/client', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setFormData(response.data);
          setProfileExists(true);
        }
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Failed to load profile data');
          toast.error('Failed to load profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = profileExists
        ? '/profile/client/update'
        : '/profile/client';
      const response = await api.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        setProfileExists(true);
        toast.success(
          profileExists
            ? 'Profile updated successfully!'
            : 'Profile created successfully!'
        );
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || 'Failed to save profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
          <h2 className={styles.title}>
            {profileExists ? 'Update Your Profile' : 'Create Your Profile'}
          </h2>
          {profileExists && (
            <div className={styles.profileStatus}>
              <span className={styles.checkmark}>✓</span>
              Profile created on{' '}
              {new Date(formData.created_at).toLocaleDateString()}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <div className={styles.errorContent}>
                <span className={styles.errorIcon}>⚠️</span>
                <p className={styles.errorMessage}>{error}</p>
                <button
                  type="button"
                  className={styles.dismissError}
                  onClick={() => setError('')}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>Company Name</label>
            </div>
            <input
              type="text"
              className={styles.input}
              value={formData.company_name}
              onChange={(e) =>
                setFormData({ ...formData, company_name: e.target.value })
              }
              placeholder="Your Company Name"
              required
            />
          </div>

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label className={styles.label}>Industry</label>
              </div>
              <input
                type="text"
                className={styles.input}
                value={formData.industry}
                onChange={(e) =>
                  setFormData({ ...formData, industry: e.target.value })
                }
                placeholder="e.g., Technology, Healthcare"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label className={styles.label}>Company Size</label>
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
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="501+">501+ employees</option>
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
              placeholder="https://your-company.com"
            />
          </div>

          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loadingText}>
                  {profileExists ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                <span>
                  {profileExists ? 'Update Profile' : 'Create Profile'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientProfile;
