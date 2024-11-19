// Features.js
import { FileText, Grid, Search, Video } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import styles from './Features.module.css';

const Features = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Public Requests',
      path: '/public-requests',
      requiresAuth: false,
    },
    {
      icon: FileText,
      title: 'My Requests',
      path: '/requests',
      requiresAuth: true,
    },
    {
      icon: Video,
      title: 'Videos',
      path: '/videos',
      requiresAuth: true,
    },
    {
      icon: Grid,
      title: 'Applications',
      path: '/app-dashboard',
      requiresAuth: true,
    },
  ];

  const handleNavigation = (feature) => {
    if (feature.requiresAuth && !isAuthenticated) {
      navigate('/login', { state: { from: feature.path } });
    } else {
      navigate(feature.path);
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.features}>
        <div className={styles.featureCards}>
          {features.map((feature) => (
            <div
              key={feature.path}
              className={styles.card}
              onClick={() => handleNavigation(feature)}
            >
              <div className={styles.iconWrapper}>
                <feature.icon
                  size={32}
                  strokeWidth={1.5}
                  className={styles.icon}
                />
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.comingSoon}>
        <em>
          * Top developers, featured projects, and popular videos coming soon
        </em>
      </div>
    </div>
  );
};

export default Features;
