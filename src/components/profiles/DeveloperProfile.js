// DeveloperProfile.js
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createDeveloperProfile,
  fetchProfile,
  updateDeveloperProfile,
} from '../../redux/profileSlice';
import styles from './DeveloperProfile.module.css';

const DeveloperProfile = () => {
  const dispatch = useDispatch();
  const {
    data: profile,
    loading,
    error,
  } = useSelector((state) => state.profile);

  const [formData, setFormData] = useState({
    skills: '',
    experience_years: '',
    hourly_rate: '',
    github_url: '',
    portfolio_url: '',
    bio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        skills: profile.skills || '',
        experience_years: profile.experience_years || '',
        hourly_rate: profile.hourly_rate || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const processedData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
        hourly_rate: parseInt(formData.hourly_rate) || 0,
      };

      const action = profile
        ? await dispatch(updateDeveloperProfile(processedData))
        : await dispatch(createDeveloperProfile(processedData));

      if (action.type.endsWith('/fulfilled')) {
        toast.success(
          profile
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

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {profile ? 'Update Your Profile' : 'Create Your Profile'}
          </h2>
          {profile && (
            <div className={styles.profileStatus}>
              <span className={styles.checkmark}>✓</span>
              Profile created on{' '}
              {new Date(profile.created_at).toLocaleDateString()}
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
                  onClick={() => dispatch({ type: 'profile/clearError' })}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>Skills</label>
              <span className={styles.required}>*</span>
            </div>
            <input
              type="text"
              className={styles.input}
              value={formData.skills}
              onChange={(e) =>
                setFormData({ ...formData, skills: e.target.value })
              }
              placeholder="Python, React, FastAPI..."
              required
            />
            <span className={styles.helpText}>Separate skills with commas</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label className={styles.label}>Experience (years)</label>
                <span className={styles.required}>*</span>
              </div>
              <input
                type="number"
                className={styles.input}
                value={formData.experience_years}
                onChange={(e) =>
                  setFormData({ ...formData, experience_years: e.target.value })
                }
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.labelContainer}>
                <label className={styles.label}>Hourly Rate ($)</label>
                <span className={styles.required}>*</span>
              </div>
              <input
                type="number"
                className={styles.input}
                value={formData.hourly_rate}
                onChange={(e) =>
                  setFormData({ ...formData, hourly_rate: e.target.value })
                }
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>GitHub URL</label>
            </div>
            <input
              type="url"
              className={styles.input}
              value={formData.github_url}
              onChange={(e) =>
                setFormData({ ...formData, github_url: e.target.value })
              }
              placeholder="https://github.com/username"
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>Portfolio URL</label>
            </div>
            <input
              type="url"
              className={styles.input}
              value={formData.portfolio_url}
              onChange={(e) =>
                setFormData({ ...formData, portfolio_url: e.target.value })
              }
              placeholder="https://portfolio.dev"
            />
          </div>

          <div className={styles.formGroup}>
            <div className={styles.labelContainer}>
              <label className={styles.label}>Bio</label>
              <span className={styles.required}>*</span>
            </div>
            <textarea
              className={styles.textarea}
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              placeholder="Tell us about yourself..."
              rows={4}
              required
            />
            <span className={styles.helpText}>
              Brief description of your experience and expertise
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

export default DeveloperProfile;
