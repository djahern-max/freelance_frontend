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
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const location = useLocation();
  const [expandedBioId, setExpandedBioId] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const TRUNCATE_LENGTH = 150;

  const toggleReadMore = (id) => {
    setExpandedBioId(expandedBioId === id ? null : id);
  };

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
    toast.success(
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Request Sent Successfully
        </span>
        <span>
          Your request has been shared with {creatorUsername}. They will be
          notified and can review it shortly.
        </span>
      </div>,
      {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
    setSelectedCreator(null);
  };

  const handleSendRequest = (developer) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (user?.userType === 'developer') {
      toast.info(
        'As a developer, you cannot send requests to other developers.'
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
                  {expandedBioId === developer.id ||
                  developer.bio.length <= TRUNCATE_LENGTH
                    ? developer.bio
                    : `${developer.bio.slice(0, TRUNCATE_LENGTH)}...`}
                  {developer.bio.length > TRUNCATE_LENGTH && (
                    <button
                      onClick={() => toggleReadMore(developer.id)}
                      className={styles.readMoreButton}
                    >
                      {expandedBioId === developer.id
                        ? 'Read less'
                        : 'Read more'}
                    </button>
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
                {user?.userType !== 'developer' && (
                  <button
                    onClick={() => handleSendRequest(developer)}
                    className={styles.contactButton}
                  >
                    <MessageSquare size={16} />
                    <span>Send Request</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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

      {selectedCreator && user?.userType !== 'developer' && (
        <CreateRequestModal
          creatorId={String(selectedCreator.id)} // Convert the number to a string
          creatorUsername={selectedCreator.username}
          onClose={() => setSelectedCreator(null)}
          onSubmit={async (formData) => {
            try {
              await api.post('/requests/', {
                ...formData,
                developer_id: selectedCreator.id,
              });
              handleRequestSent(selectedCreator.username);
            } catch (error) {
              toast.error('Failed to send request');
              console.error('Request error:', error);
            }
          }}
          onRequestSent={() => handleRequestSent(selectedCreator.username)}
        />
      )}
    </div>
  );
};

export default PublicDevelopers;
