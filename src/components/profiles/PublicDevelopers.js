// PublicDevelopers.js
import { Award, Briefcase, MessageSquare, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { API_ROUTES } from '../../utils/api'; // Import API_ROUTES as well
import styles from './PublicDevelopers.module.css';

const PublicDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedBio, setSelectedBio] = useState(null);

  const TRUNCATE_LENGTH = 150;

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const response = await api.get(API_ROUTES.PUBLIC.DEVELOPERS);
        console.log('Developer data:', response.data); // Add this to see the actual data structure
        setDevelopers(response.data);
      } catch (err) {
        console.error('Error details:', err);
        setError('Failed to load creators');
      } finally {
        setLoading(false);
      }
    };

    fetchDevelopers();
  }, []);
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingText}>Loading creators...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Creators</h1>

      <div className={styles.grid}>
        {developers.map((developer) => (
          <div key={developer.id} className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.profileHeader}>
                {developer.profile_image_url ? (
                  <img
                    src={developer.profile_image_url}
                    alt={developer?.user?.username || 'Developer'}
                    className={styles.profileImage}
                  />
                ) : (
                  <div className={styles.profileImagePlaceholder}>
                    <span>{developer?.user?.username?.[0] || 'D'}</span>
                  </div>
                )}
                <div className={styles.profileInfo}>
                  <h2 className={styles.username}>
                    {developer?.user?.username || `Developer #${developer.id}`}
                  </h2>
                  <div className={styles.rating}>
                    <Star className={styles.icon} size={16} />
                    <span>{developer.rating || 'New'}</span>
                  </div>
                </div>
              </div>
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <Briefcase className={styles.icon} size={16} />
                  <span>{developer.experience_years} years experience</span>
                </div>
                <div className={styles.statItem}>
                  <Award className={styles.icon} size={16} />
                  <span>{developer.total_projects} projects completed</span>
                </div>
              </div>
              <p className={styles.bio}>
                {developer.bio.length > TRUNCATE_LENGTH
                  ? developer.bio.slice(0, TRUNCATE_LENGTH)
                  : developer.bio}
                {developer.bio.length > TRUNCATE_LENGTH && (
                  <>
                    <span style={{ color: '#4b5563' }}>...</span>
                    <button
                      onClick={() => setSelectedBio(developer.bio)}
                      className={styles.readMoreButton}
                    >
                      Read more
                    </button>
                  </>
                )}
              </p>

              <div className={styles.skillsSection}>
                <h3 className={styles.skillsTitle}>Skills</h3>
                <div className={styles.skillsList}>
                  {developer.skills.split(',').map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => navigate(`/developers/${developer.user_id}`)}
                className={styles.contactButton}
              >
                <MessageSquare size={16} />
                <span>Contact Creator</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {developers.length === 0 && (
        <div className={styles.emptyState}>
          <p>No creators available at the moment</p>
        </div>
      )}

      {/* Modal moved outside of the mapping */}
      {selectedBio && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedBio(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setSelectedBio(null)}
              aria-label="Close"
            >
              ×
            </button>
            <div className={styles.modalContent}>
              <h3>About this Creator</h3>
              <p>{selectedBio}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicDevelopers;
