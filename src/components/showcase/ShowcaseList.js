import { MessageSquare, Star, PlusCircle, Briefcase, Code, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import CreateRequestModal from '../requests/CreateRequestModal';
import DeveloperRatingSection from '../profiles/DeveloperRatingSection';
import ShowcaseEmptyState from './ShowcaseEmptyState';
import styles from './ShowcaseList.module.css';
import ShareButton from '../videos/ShareButton';
import ReadmeModal from './ReadmeModal';
import ShowcaseRating from './ShowcaseRating';

const ShowcaseItem = ({
  showcase,
  onShowcaseClick,
  isAuthenticated,
  onSendRequest,
  user,
  formatDate
}) => {
  const [showReadmeModal, setShowReadmeModal] = useState(false);

  return (
    <div className={styles.showcaseCard}>
      <div
        className={styles.imageContainer}
        onClick={() => onShowcaseClick(showcase)}
      >
        {showcase.image_url ? (
          <img
            src={showcase.image_url}
            alt={showcase.title || 'Project Showcase'}
            className={styles.thumbnail}
          />
        ) : (
          <div className={styles.thumbnailPlaceholder}>
            <Briefcase size={32} />
          </div>
        )}
      </div>
      <div className={styles.contentContainer}>
        <h2 className={styles.showcaseTitle}>
          {showcase.title || 'Untitled Project'}
        </h2>

        {/* Replace DeveloperRatingSection with ShowcaseRating */}
        <div className={styles.rating}>
          <ShowcaseRating
            showcaseId={showcase.id}
            initialRating={showcase.average_rating}
          />
        </div>

        <div className={styles.actionButtons}>
          {user?.userType !== 'developer' && (
            <button
              className={styles.requestButton}
              onClick={(e) => {
                e.stopPropagation();
                onSendRequest(showcase);
              }}
            >
              <MessageSquare size={16} className={styles.icon} />
              <span>Send Me a Request</span>
            </button>
          )}

          <div className={styles.showcaseItem}>
            <ShareButton
              showcaseId={showcase?.id}
              projectUrl={showcase?.project_url}
            />
          </div>
        </div>

        {showcase.description && (
          <p className={styles.description}>
            {showcase.description.length > 150
              ? `${showcase.description.substring(0, 150)}...`
              : showcase.description}
          </p>
        )}

        <div className={styles.links}>
          {showcase.repository_url && (
            <a
              href={showcase.repository_url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.repoLink}
            >
              <Code size={16} />
              <span>View Repository</span>
            </a>
          )}

          {showcase.readme_url && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowReadmeModal(true);
              }}
              className={styles.readmeButton}
            >
              <FileText size={16} />
              <span>View README</span>
            </button>
          )}
        </div>

        <div className={styles.metadata}>
          <span>{formatDate(showcase.created_at)}</span>
          <div className={styles.ratingOverview}>
            <Star size={16} className={styles.starIcon} />
            <span>{showcase.average_rating?.toFixed(1) || '0.0'}</span>
            <span className={styles.ratingCount}>
              ({showcase.total_ratings || 0} ratings)
            </span>
          </div>
        </div>
      </div>

      {showReadmeModal && (
        <ReadmeModal
          content={showcase.readme_url}
          onClose={() => setShowReadmeModal(false)}
        />
      )}
    </div>
  );
};

const ShowcaseList = () => {
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShowcase, setSelectedShowcase] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const fetchShowcases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/project-showcase/');
      if (response.data && Array.isArray(response.data)) {
        setShowcases(response.data);
      } else {
        setShowcases([]);
      }
    } catch (err) {
      console.error('Showcase fetch error:', err);
      if (err.response?.status === 401) {
        setShowcases([]);
      } else {
        setError(
          "We're having trouble loading the showcases. Please try again later."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowcases();
  }, []);

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Date unavailable';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date unavailable';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Date unavailable';
    }
  };

  const handleRequestSent = (username) => {
    setSelectedCreator(null);
    toast.success(`Request sent to ${username} successfully!`);
  };

  const handleSendRequest = (showcase) => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    if (user?.userType === 'developer') {
      toast.info('As a creator, you cannot send requests to other creators.');
      return;
    }

    setSelectedCreator({
      id: showcase.developer_id,
      username: showcase.developer?.username || `Developer #${showcase.developer_id}`,
    });
  };

  const handleShowcaseClick = (showcase) => {
    if (!isAuthenticated) {
      setSelectedShowcase(showcase);
      setShowAuthDialog(true);
      return;
    }
    navigate(`/showcase/${showcase.id}`);
  };



  if (error || !showcases || showcases.length === 0) {
    return (
      <div className={styles.container}>
        <ShowcaseEmptyState
          isAuthenticated={isAuthenticated}
          userType={user?.userType}
          onCreateShowcase={() => navigate('/showcase/create')}
          onSignUp={() => setShowAuthDialog(true)}
          error={error}
          onRetry={fetchShowcases}
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        {isAuthenticated && user?.userType === 'developer' && (
          <button
            className={styles.createShowcaseButton}
            onClick={() => navigate('/showcase/create')}
          >
            <PlusCircle size={16} />
            <span>Create Showcase</span>
          </button>
        )}
      </div>

      <div className={styles.grid}>
        {showcases.map((showcase) => (
          <ShowcaseItem
            key={showcase.id}
            showcase={showcase}
            onShowcaseClick={handleShowcaseClick}
            isAuthenticated={isAuthenticated}
            onSendRequest={handleSendRequest}
            user={user}
            formatDate={formatDate}
          />
        ))}
      </div>

      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => {
          setShowAuthDialog(false);
          setSelectedShowcase(null);
        }}
        onLogin={() =>
          navigate('/login', { state: { from: location.pathname } })
        }
        onRegister={() =>
          navigate('/register', { state: { from: location.pathname } })
        }
      />

      {selectedCreator && (
        <CreateRequestModal
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
        />
      )}
    </div>
  );
};

export default ShowcaseList;
