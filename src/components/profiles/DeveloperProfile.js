import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  createDeveloperProfile,
  fetchDeveloperProfile, // Corrected here
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
  const [showImageUpload, setShowImageUpload] = useState(false);

  useEffect(() => {
    dispatch(fetchDeveloperProfile())
      .unwrap()
      .then((data) => {
        console.log('Fetched developer profile:', data);
        setFormData({
          skills: data.skills || '',
          experience_years: data.experience_years?.toString() || '',
          bio: data.bio || '',
          is_public: data.is_public || false,
        });
      })
      .catch((err) => {
        console.error('Error fetching developer profile:', err);
      });
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      const profileData = profile.developer_profile || profile; // Remove `developer_profile` if unnecessary
      setFormData({
        skills: profileData.skills || '',
        experience_years: profileData.experience_years?.toString() || '',
        bio: profileData.bio || '',
        is_public: profileData.is_public || false,
      });
    } else {
      console.log('No profile found, using default values');
      setFormData(DEFAULT_VALUES); // Fallback to default values
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const processedData = {
        ...formData,
        experience_years: parseInt(formData.experience_years) || 0,
      };

      const action = profile?.developer_profile
        ? await dispatch(updateDeveloperProfile(processedData))
        : await dispatch(createDeveloperProfile(processedData));

      if (action.type.endsWith('/fulfilled')) {
        toast.success(
          profile?.developer_profile
            ? 'Profile updated successfully!'
            : 'Profile created successfully!'
        );

        // Show image upload option after successful profile creation
        if (!profile?.developer_profile) {
          setShowImageUpload(true);
        }
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

  const handleImageUploadSuccess = (imageUrl) => {
    toast.success('Profile picture uploaded successfully!');
    // Refresh profile data to show new image
    dispatch(fetchDeveloperProfile());
    setShowImageUpload(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading profile...</div>
      </div>
    );
  }

  const hasProfile = !!profile?.developer_profile;

  // Show the image upload prompt after successful profile creation
  if (showImageUpload) {
    return (
      <div className={styles.imageUploadPrompt}>
        <h2>Would you like to add a profile picture?</h2>
        <div className={styles.imageUploadContainer}>
          <ImageUpload
            mode="upload"
            onUploadSuccess={handleImageUploadSuccess}
          />
        </div>
        <button
          className={styles.skipButton}
          onClick={() => setShowImageUpload(false)}
        >
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {hasProfile ? 'Update Your Profile' : 'Create Your Profile'}
          </h2>
          {hasProfile && (
            <>
              <div className={styles.profileStatus}>
                <span className={styles.checkmark}>✓</span>
                Profile created on{' '}
                {new Date(
                  profile.developer_profile.created_at
                ).toLocaleDateString()}
              </div>
              <ImageUpload
                mode="upload"
                onUploadSuccess={handleImageUploadSuccess}
                currentImageUrl={profile.developer_profile.profile_image_url}
              />
            </>
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
