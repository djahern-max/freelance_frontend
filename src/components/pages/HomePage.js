import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../../redux/authSlice';
import ClientDashboard from '../dashboards/ClientDashboard';
import DeveloperDashboard from '../dashboards/DeveloperDashboard';
import Features from '../shared/Features';

function HomePage() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userType = user?.user_type;

  // Only show dashboard content if user is authenticated
  if (isAuthenticated) {
    return (
      <div className="authenticated-container">
        {userType === 'developer' && <DeveloperDashboard />}
        {userType === 'client' && <ClientDashboard />}
      </div>
    );
  }

  // Public landing page without profile prompt
  return (
    <main className="landing-container" style={{ marginTop: '0' }}>
      <Features />
    </main>
  );
}

export default HomePage;
