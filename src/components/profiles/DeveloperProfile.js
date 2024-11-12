import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  User,
  Mail,
  GitHub,
  LinkedIn,
  Briefcase,
  Star,
  Code,
  DollarSign,
} from "lucide-react";
import Header from "../shared/Header";
import styles from "./DeveloperProfile.module.css";

const DeveloperProfile = () => {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    completedProjects: 0,
    activeProjects: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(null);

  const { token, user } = useSelector((state) => state.auth);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/developers/${user.id}/profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProfile(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/developers/${user.id}/profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(formData);
      setEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };

  const renderProfileForm = () => (
    <form onSubmit={handleSubmit} className={styles.profileForm}>
      <div className={styles.formGroup}>
        <label>Skills</label>
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleInputChange}
          placeholder="e.g., Python, React, AI Development"
        />
      </div>

      <div className={styles.formGroup}>
        <label>Experience (years)</label>
        <input
          type="number"
          name="experience_years"
          value={formData.experience_years}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Hourly Rate ($)</label>
        <input
          type="number"
          name="hourly_rate"
          value={formData.hourly_rate}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>GitHub URL</label>
        <input
          type="url"
          name="github_url"
          value={formData.github_url}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>LinkedIn URL</label>
        <input
          type="url"
          name="linkedin_url"
          value={formData.linkedin_url}
          onChange={handleInputChange}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Bio</label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
        />
      </div>

      <div className={styles.formActions}>
        <button type="submit" className={styles.saveButton}>
          Save Changes
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={styles.cancelButton}
        >
          Cancel
        </button>
      </div>
    </form>
  );

  const renderProfile = () => (
    <div className={styles.profileInfo}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <User size={48} />
        </div>
        <div className={styles.profileMeta}>
          <h2>{user.username}</h2>
          <p className={styles.subtitle}>Developer</p>
        </div>
        {user.id === profile.user_id && (
          <button
            onClick={() => setEditing(true)}
            className={styles.editButton}
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Briefcase className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.completedProjects}</span>
            <span className={styles.statLabel}>Completed Projects</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Star className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{stats.averageRating}</span>
            <span className={styles.statLabel}>Average Rating</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <Code className={styles.statIcon} />
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{profile.experience_years}</span>
            <span className={styles.statLabel}>Years Experience</span>
          </div>
        </div>
      </div>

      <div className={styles.profileSection}>
        <h3>Skills</h3>
        <div className={styles.skillsList}>
          {profile.skills.split(",").map((skill, index) => (
            <span key={index} className={styles.skillTag}>
              {skill.trim()}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.profileSection}>
        <h3>Rate</h3>
        <p className={styles.rate}>
          <DollarSign className={styles.icon} />${profile.hourly_rate}/hour
        </p>
      </div>

      {profile.bio && (
        <div className={styles.profileSection}>
          <h3>About</h3>
          <p className={styles.bio}>{profile.bio}</p>
        </div>
      )}

      <div className={styles.profileSection}>
        <h3>Connect</h3>
        <div className={styles.socialLinks}>
          {profile.github_url && (
            <a
              href={profile.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <GitHub className={styles.icon} /> GitHub
            </a>
          )}
          {profile.linkedin_url && (
            <a
              href={profile.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <LinkedIn className={styles.icon} /> LinkedIn
            </a>
          )}
          <a href={`mailto:${profile.email}`} className={styles.socialLink}>
            <Mail className={styles.icon} /> Email
          </a>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loading}>Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        {editing ? renderProfileForm() : renderProfile()}
      </div>
    </div>
  );
};

export default DeveloperProfile;
