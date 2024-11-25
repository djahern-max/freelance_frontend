import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import Register from './components/auth/Register';
import ProtectedRoute from './components/common/ProtectedRoute';
import ConversationDetail from './components/conversations/ConversationDetail';
import ConversationsList from './components/conversations/ConversationsList';
import RequestDetails from './components/conversations/RequestDetails';
import RequestResponses from './components/conversations/RequestResponses';
import AppDashboard from './components/dashboards/AppDashboard';
import ClientDashboard from './components/dashboards/ClientDashboard';
import DeveloperDashboard from './components/dashboards/DeveloperDashboard';
import Home from './components/pages/HomePage';
import CreateProject from './components/projects/CreateProject';
import ProjectDetails from './components/projects/ProjectDetails';
import ProjectsList from './components/projects/ProjectsList';
import PublicRequests from './components/requests/PublicRequests';
import Requests from './components/requests/Request';
import Settings from './components/settings/Settings';
import Header from './components/shared/Header';
import VideoList from './components/videos/VideoList';
import VideoUpload from './components/videos/VideoUpload';
import { login } from './redux/authSlice';
import { store } from './redux/store';
import './styles/global.css';
import api from './utils/api';

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      console.log('Checking auth with token:', token);

      api
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log('User data received:', response.data);
          dispatch(
            login({
              token,
              user: {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                fullName: response.data.full_name,
                isActive: response.data.is_active,
                userType: response.data.user_type,
                createdAt: response.data.created_at,
              },
            })
          );
        })
        .catch((error) => {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        });
    }
  }, [dispatch]);

  return (
    <>
      <Header />
      <div className="app-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          {/* Client-specific routes */}
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute userType="client">
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-project"
            element={
              <ProtectedRoute userType="client">
                <CreateProject />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute userType="client">
                <ProjectDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <Requests />
              </ProtectedRoute>
            }
          />

          {/* Developer-specific routes */}
          <Route
            path="/developer-dashboard"
            element={
              <ProtectedRoute userType="developer">
                <DeveloperDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/public-requests"
            element={
              <ProtectedRoute>
                <PublicRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/app-dashboard"
            element={
              <ProtectedRoute>
                <AppDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/videos"
            element={
              <ProtectedRoute>
                <VideoList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/video-upload"
            element={
              <ProtectedRoute>
                <VideoUpload />
              </ProtectedRoute>
            }
          />

          {/* Shared routes */}

          <Route
            path="/conversations"
            element={
              <ProtectedRoute>
                <ConversationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/conversations/:id"
            element={
              <ProtectedRoute>
                <ConversationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/responses"
            element={
              <ProtectedRoute>
                <RequestResponses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests/:requestId"
            element={
              <ProtectedRoute>
                <RequestDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectsList />
              </ProtectedRoute>
            }
          />

          {/* Dashboard redirect based on user type */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {({ user }) => (
                  <Navigate
                    to={
                      user.userType === 'client'
                        ? '/client-dashboard'
                        : '/developer-dashboard'
                    }
                    replace
                  />
                )}
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
