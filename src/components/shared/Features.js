import { Search, Users2, Video, Bot } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectIsAuthenticated } from '../../redux/authSlice';
import ExecutableDisplay from '../marketplace/product/ProductListing'; // Add this import
import styles from './Features.module.css';

const Features = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  const features = [

    {
      icon: Search,
      title: 'Opportunities',
      path: '/opportunities',
      requiresAuth: false,
    },
    {
      icon: Bot,
      title: 'Agents',
      path: '/marketplace/products',
      requiresAuth: false,
    },
    {
      icon: Users2,
      title: 'Creators',
      path: '/creators',
      requiresAuth: false,
    },
    {
      icon: Video,
      title: 'Videos',
      path: '/videos',
      requiresAuth: false,
    },
  ];

  const handleNavigation = (feature) => {
    navigate(feature.path);
  };

  // Rest of your component remains the same
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
              <p className={styles.description}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.comingSoon}>
        <em>
          {/* * Top developers, featured projects, and popular videos coming soon */}
        </em>
      </div>
    </div>
  );
};

export default Features;