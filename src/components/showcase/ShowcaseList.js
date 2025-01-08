import { MessageSquare, Star, Plus, Briefcase, Code, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import CreateRequestModal from '../requests/CreateRequestModal';
import DeveloperRatingSection from '../profiles/DeveloperRatingSection';
import ShowcaseEmptyState from './ShowcaseEmptyState';
import SubscriptionDialog from '../payments/SubscriptionDialog';
import styles from './ShowcaseList.module.css';
import ReadmeModal from './ReadmeModal';
import ShowcaseRating from './ShowcaseRating';
import { Edit } from 'lucide-react';


const ShowcaseItem = ({
  showcase,
  onShowcaseClick,
  isAuthenticated,
  onSendRequest,
  user,
  formatDate
}) => {
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const isOwner = user && showcase.developer_id === user.id;
  const [isExpanded, setIsExpanded] = useState(false);

  const MAX_LENGTH = 150;
  const hasLongDescription = showcase.description?.length > MAX_LENGTH;

  const renderDescription = () => {
    if (!showcase.description) return null;

    if (!hasLongDescription) {
      return <p className={styles.description}>{showcase.description}</p>;
    }

    return (
      <div className={styles.description}>
        <p>
          {isExpanded
            ? showcase.description
            : `${showcase.description.substring(0, MAX_LENGTH)}...`}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={styles.readMoreButton}
        >
          {isExpanded ? 'Read Less' : 'Read More'}
        </button>
      </div>
    );
  };


  const navigate = useNavigate();

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
        <div className={styles.headerActions}>
          <h2 className={styles.showcaseTitle}>
            {showcase.title || 'Untitled Project'}
          </h2>
          {isOwner && (
            <button
              onClick={(e) => {
                e.preventDefault(); // Prevent any default behavior
                e.stopPropagation(); // Prevent event bubbling
                navigate(`/showcase/${showcase.id}/edit`); // Navigate to edit route
              }}
              className={styles.editButton}
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
          )}
        </div>

        {showcase.developer_id && (
          <div className={styles.developerInfo}>
            <span className={styles.developerLabel}>Creator: </span>
            <span
              className={styles.developerName}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/developers/${showcase.developer_id}`);
              }}
            >
              {showcase.developer?.username || `Developer #${showcase.developer_id}`}
            </span>
          </div>
        )}



        {renderDescription()}



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


        </div>




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

          {showReadmeModal && (
            <ReadmeModal
              showcaseId={showcase.id}
              onClose={() => setShowReadmeModal(false)}
            />
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


    </div>
  );
};

const ShowcaseList = () => {
  const [showcases, setShowcases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShowcase, setSelectedShowcase] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
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

  const handleCreateProject = async () => {
    if (!isAuthenticated) {
      setShowAuthDialog(true);
      return;
    }

    try {
      // Check subscription status
      const response = await api.get('/payments/subscription-status');

      if (response.data.status !== 'active') {
        setShowSubscriptionDialog(true);
        return;
      }

      // If authenticated and has subscription, navigate to create page
      navigate('/showcase/create');
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Unable to verify subscription status. Please try again.');
    }
  };

  const handleSubscriptionSuccess = () => {
    setShowSubscriptionDialog(false);
    navigate('/showcase/create');
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
          onCreateShowcase={handleCreateProject}
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
            onClick={handleCreateProject}
          >
            <Plus size={16} />
            <span>Add Project</span>
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

      <SubscriptionDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSuccess={handleSubscriptionSuccess}
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