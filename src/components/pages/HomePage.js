import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import RankedShowcaseList from '../showcase/RankedShowcaseList';
import Footer from '../shared/Footer';
import styles from './HomePage.module.css';

const HomePage = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleNavCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className={isAuthenticated ? styles.authenticatedContainer : styles.landingContainer}>
      <div className={styles.content}>
        {/* Navigation Cards at the top */}
        {/* <div className={styles.cardsGrid}>
          <div className={styles.navCard} onClick={() => handleNavCardClick('/opportunities')}>
            <div className={styles.navIcon}>🚀</div>
            <div className={styles.navTitle}>Opportunities</div>
          </div>
          <div className={styles.navCard} onClick={() => handleNavCardClick('/creators')}>
            <div className={styles.navIcon}>👨‍💻</div>
            <div className={styles.navTitle}>Developers</div>
          </div>
          <div className={styles.navCard} onClick={() => handleNavCardClick('/videos')}>
            <div className={styles.navIcon}>🎬</div>
            <div className={styles.navTitle}>Videos</div>
          </div>
          <div className={styles.navCard} onClick={() => handleNavCardClick('/showcase')}>
            <div className={styles.navIcon}>💻</div>
            <div className={styles.navTitle}>Projects</div>
          </div>

        </div> */}

        {/* Showcases below the cards */}
        <div className={styles.showcaseSection}>
          <RankedShowcaseList limit={10} title="Top Ranked Projects" />
        </div>


      </div>
      <Footer />
    </div>
  );
};

export default HomePage;