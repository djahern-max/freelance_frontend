import { Award, Briefcase, Loader, MessageSquare, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { API_ROUTES } from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import CreateRequestModal from '../requests/CreateRequestModal';
import DevelopersEmptyState from './DevelopersEmptyState';
import styles from './PublicDevelopers.module.css';

const PublicDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedBio, setSelectedBio] = useState(null);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const location = useLocation();

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const TRUNCATE_LENGTH = 150;

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(API_ROUTES.PUBLIC.DEVELOPERS);
      console.log('Developer data:', response.data);
      setDevelopers(response.data);
    } catch (err) {
      console.error('Error details:', err);
      setError('Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleRequestSent = (creatorUsername) => {
    toast.success(`Request sent to ${creatorUsername}`);
    setSelectedCreator(null);
  };

  const handleSendRequest = (developer) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (user?.userType === 'developer') {
      // For developers, implement request forwarding
      // You can either navigate to a different view or show a different modal
      toast.info(
        'As a creator, you can forward requests but not create new ones.'
      );
      return;
    }

    setSelectedCreator({
      id: developer.user_id || developer.id,
      username: getUsername(developer),
    });
  };

  const getUsername = (developer) => {
    return (
      developer?.user?.full_name ||
      developer?.user?.username ||
      `Developer #${developer.id}`
    );
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loader className={styles.spinner} />
          <div className={styles.loadingText}>Loading creators...</div>
        </div>
      ) : developers.length === 0 ? (
        <DevelopersEmptyState
          isAuthenticated={isAuthenticated}
          userType={user?.userType}
          onCreateProfile={() => navigate('/profile/developer')}
          onSignUp={() => setShowAuthDialog(true)}
          error={error}
          onRetry={fetchDevelopers}
        />
      ) : (
        <div className={styles.grid}>
          {developers.map((developer) => (
            <div key={developer.id} className={styles.card}>
              <div className={styles.cardContent}>
                <div className={styles.profileHeader}>
                  {developer.profile_image_url ? (
                    <img
                      src={developer.profile_image_url}
                      alt={getUsername(developer)}
                      className={styles.profileImage}
                    />
                  ) : (
                    <div className={styles.profileImagePlaceholder}>
                      <span>{getUsername(developer).charAt(0) || 'D'}</span>
                    </div>
                  )}
                  <div className={styles.profileInfo}>
                    <h2 className={styles.username}>
                      {getUsername(developer)}
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
                  onClick={() => handleSendRequest(developer)}
                  className={styles.contactButton}
                >
                  <MessageSquare size={16} />
                  <span>
                    {user?.userType === 'developer'
                      ? 'Forward Request'
                      : 'Send Request to Creator'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add AuthDialog component */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onLogin={() =>
          navigate('/login', { state: { from: location.pathname } })
        }
        onRegister={() =>
          navigate('/register', { state: { from: location.pathname } })
        }
      />

      {/* Bio Modal */}
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

      {/* Create Request Modal */}
      {selectedCreator && user?.userType !== 'developer' && (
        <CreateRequestModal
          creatorId={selectedCreator.id}
          creatorUsername={selectedCreator.username}
          onClose={() => setSelectedCreator(null)}
          onRequestSent={() => handleRequestSent(selectedCreator.username)}
        />
      )}
    </div>
  );
};

export default PublicDevelopers;
