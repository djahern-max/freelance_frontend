import { Briefcase, Loader, Star, Users2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import AuthDialog from '../auth/AuthDialog';
import Header from '../shared/Header';
import styles from './Creators.module.css';

const Creators = () => {
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState(null);

  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const fetchDevelopers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/developers/public', null, true);
      setDevelopers(response.data);
    } catch (err) {
      console.error('Error fetching developers:', err);
      setError('Failed to load creators');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const handleDeveloperClick = (developer) => {
    if (!isAuthenticated) {
      setSelectedDeveloper(developer);
      setShowAuthDialog(true);
      return;
    }
    navigate(`/developers/${developer.user_id}`);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader className={styles.spinner} />
        <p>Loading creators...</p>
      </div>
    );
  }

  return (
    <div className={styles.mainContainer}>
      <Header />
      <main className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>AI Application Creators</h1>
          {!isAuthenticated && (
            <p className={styles.subtitle}>
              Browse our talented developers. Sign in to connect and
              collaborate.
            </p>
          )}
        </div>

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchDevelopers}>Try Again</button>
          </div>
        )}

        <div className={styles.developersGrid}>
          {developers.map((developer) => (
            <div
              key={developer.id}
              className={styles.developerCard}
              onClick={() => handleDeveloperClick(developer)}
            >
              <div className={styles.profileImage}>
                {developer.profile_image_url ? (
                  <img src={developer.profile_image_url} alt="Profile" />
                ) : (
                  <Users2 size={40} />
                )}
              </div>

              <div className={styles.developerInfo}>
                <h3>{developer.user.username}</h3>
                <p className={styles.bio}>{developer.bio}</p>

                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <Briefcase size={16} />
                    <span>{developer.experience_years} years</span>
                  </div>

                  {developer.rating && (
                    <div className={styles.stat}>
                      <Star size={16} />
                      <span>{developer.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.skills}>
                  {developer.skills.split(',').map((skill, index) => (
                    <span key={index} className={styles.skill}>
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <AuthDialog
          isOpen={showAuthDialog}
          onClose={() => {
            setShowAuthDialog(false);
            setSelectedDeveloper(null);
          }}
          onLogin={() => navigate('/login')}
          onRegister={() => navigate('/register')}
        />
      </main>
    </div>
  );
};

export default Creators;
