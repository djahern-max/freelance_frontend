import { Award, Briefcase, Loader, MessageSquare, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { API_ROUTES } from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import CreateRequestModal from '../requests/CreateRequestModal';
import DeveloperRatingSection from './DeveloperRatingSection';
import DevelopersEmptyState from './DevelopersEmptyState';
import styles from './PublicDevelopers.module.css';
import RatingModal from './RatingModal';

const PublicDevelopers = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const location = useLocation();
  const [expandedBioId, setExpandedBioId] = useState(null);
  const [ratingDeveloper, setRatingDeveloper] = useState(null);

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
      // Log the request attempt
      console.log('Fetching public developers...');
      const response = await api.get(API_ROUTES.PUBLIC.DEVELOPERS);
      console.log('Developers response:', response.data);

      if (Array.isArray(response.data)) {
        setDevelopers(response.data);
      } else {
        console.error('Invalid developers data format:', response.data);
        setError('Invalid data format received from server');
      }
    } catch (err) {
      console.error('Error fetching developers:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.detail || 'Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current user:', user);
    console.log('Is authenticated:', isAuthenticated);
  }, [user, isAuthenticated]);

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

  const handleRateCreator = (developer) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (user?.user_type !== 'client') {
      toast.info('Only clients can rate creators');
      return;
    }

    setRatingDeveloper(developer);
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
                      <DeveloperRatingSection developerId={developer.user_id} />
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

                <div className={styles.buttonContainer}>
                  {user?.userType !== 'developer' && (
                    <button
                      onClick={() => handleSendRequest(developer)}
                      className={styles.contactButton}
                    >
                      <MessageSquare size={16} />
                      <span>Send Me a Request</span>
                    </button>
                  )}
                  {user?.user_type === 'client' && (
                    <button
                      onClick={() => handleRateCreator(developer)}
                      className={styles.rateButton}
                    >
                      <Star size={16} />
                      <span>Rate Creator</span>
                    </button>
                  )}
                </div>
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

      {ratingDeveloper && (
        <RatingModal
          developerId={ratingDeveloper.user_id}
          onClose={() => setRatingDeveloper(null)}
          onRatingSubmitted={() => {
            fetchDevelopers(); // Refresh the developers list to update ratings
          }}
        />
      )}
    </div>
  );
};

export default PublicDevelopers;
