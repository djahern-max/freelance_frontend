import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../redux/authSlice';
import ClientDashboard from '../dashboards/ClientDashboard';
import DeveloperDashboard from '../dashboards/DeveloperDashboard';
import Features from '../shared/Features';
import Header from '../shared/Header';
import styles from './HomePage.module.css';

function HomePage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userType = user?.userType;

  if (isAuthenticated && userType) {
    return (
      <div className={styles.authenticatedContainer}>
        {userType === 'developer' && <DeveloperDashboard />}
        {userType === 'client' && <ClientDashboard />}
      </div>
    );
  }

  return (
    <div className={styles.landingContainer}>
      <Header />
      <div className={styles.content}>
        <Features />
      </div>
    </div>
  );
}

export default HomePage;
