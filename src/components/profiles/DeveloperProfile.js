import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createDeveloperProfile,
  fetchProfile,
  updateDeveloperProfile,
} from '../../redux/profileSlice';
import styles from './DeveloperProfile.module.css';
import ImageUpload from './ImageUpload';

const DEFAULT_VALUES = {
  skills: '',
  experience_years: '',
  bio: '',
  is_public: false,
};

const PLACEHOLDERS = {
  skills: 'Python, React, FastAPI...',
  experience_years: '0',
  bio: 'Tell us about your experience and expertise...',
};

const DeveloperProfile = () => {
  const dispatch = useDispatch();
  const {
    data: profile,
    loading,
    error,
  } = useSelector((state) => state.profile);
  const [formData, setFormData] = useState(DEFAULT_VALUES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  // Fetch profile data on component mount
  useEffect(() => {
    dispatch(fetchProfile())
      .unwrap()
      .catch((err) => {
        // Only show error toast if it's not a 404
        if (err.status !== 404) {
          toast.error('Error loading profile');
        }
      });
  }, [dispatch]);

  // Update form when profile data is loaded
  useEffect(() => {
    if (profile?.developer_profile) {
      const profileData = profile.developer_profile;
      setFormData({
        skills: profileData.skills || '',
        experience_years: profileData.experience_years?.toString() || '',
        bio: profileData.bio || '',
        is_public: profileData.is_public || false,
      });
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let processedData;

      if (imageFile) {
        processedData = new FormData();
        processedData.append('file', imageFile);
        processedData.append('skills', formData.skills);
        processedData.append(
          'experience_years',
          parseInt(formData.experience_years) || 0
        );
        processedData.append('bio', formData.bio);
        processedData.append('is_public', formData.is_public);
      } else {
        processedData = {
          ...formData,
          experience_years: parseInt(formData.experience_years) || 0,
        };
      }

      const action = hasProfile
        ? await dispatch(updateDeveloperProfile(processedData))
        : await dispatch(createDeveloperProfile(processedData));

      if (action.type.endsWith('/fulfilled')) {
        toast.success(
          hasProfile
            ? 'Profile updated successfully!'
            : 'Profile created successfully!'
        );
        setImageFile(null);
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

  const hasProfile = !!profile?.developer_profile;

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
              {new Date(
                profile.developer_profile.created_at
              ).toLocaleDateString()}
            </div>
          )}
        </div>

        <ImageUpload
          mode={hasProfile ? 'upload' : 'select'}
          onUploadSuccess={(url) => {
            // For existing profile updates
            dispatch(
              updateDeveloperProfile({ ...formData, profile_image_url: url })
            );
          }}
          onFileSelect={(file) => {
            // For new profile creation
            setImageFile(file);
          }}
          currentImageUrl={profile?.developer_profile?.profile_image_url}
        />

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
              placeholder={PLACEHOLDERS.skills}
              required
            />
            <span className={styles.helpText}>Separate skills with commas</span>
          </div>

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
              placeholder={PLACEHOLDERS.experience_years}
              min="0"
              required
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
              placeholder={PLACEHOLDERS.bio}
              rows={4}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) =>
                  setFormData({ ...formData, is_public: e.target.checked })
                }
                className={styles.checkbox}
              />
              Make my profile public
            </label>
            <span className={styles.helpText}>
              Public profiles are visible to all users and can help you get more
              projects
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

export default DeveloperProfile;
