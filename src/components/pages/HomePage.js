import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../redux/authSlice';
import ClientDashboard from '../dashboards/ClientDashboard';
import DeveloperDashboard from '../dashboards/DeveloperDashboard';
import Features from '../shared/Features';
import Header from '../shared/Header';

function HomePage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userType = user?.userType; // Changed from user_type to userType

  // Only show dashboard content if user is authenticated
  if (isAuthenticated && userType) {
    return (
      <div className="authenticated-container">
        {userType === 'developer' && <DeveloperDashboard />}
        {userType === 'client' && <ClientDashboard />}
      </div>
    );
  }

  // Public landing page with Features
  return (
    <main className="landing-container" style={{ marginTop: '0' }}>
      <Header />
      <Features />
    </main>
  );
}

export default HomePage;
