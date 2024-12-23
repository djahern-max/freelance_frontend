import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
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
import SubscriptionSuccess from './components/payments/SubscriptionSuccess';
import PublicDevelopers from './components/profiles/PublicDevelopers';
import CreateProject from './components/projects/CreateProject';
import ProjectAgreementView from './components/projects/ProjectAgreementView';
import ProjectDetails from './components/projects/ProjectDetails';
import ProjectsList from './components/projects/ProjectsList';
import PublicRequests from './components/requests/PublicRequests';
import Requests from './components/requests/Request';
import Settings from './components/settings/Settings';
import Footer from './components/shared/Footer';
import Header from './components/shared/Header';
import VideoList from './components/videos/VideoList';
import VideoUpload from './components/videos/VideoUpload';
import DeveloperProfileView from './components/profiles/DeveloperProfileView';
import ProductList from './components/marketplace/product/ProductList';
import ProductDetail from './components/marketplace/product/ProductDetail';
import ProductUpload from './components/marketplace/product/ProductUpload';
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

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false} // Show progress bar for better UX
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{
          background: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          padding: '12px 24px',
        }}
        toastClassName="custom-toast"
        progressStyle={{
          background: 'var(--primary-color, #007bff)'
        }}
      />
      <Routes>
        {/* Conversation route without header/footer */}
        <Route
          path="/conversations/:id"
          element={
            <ProtectedRoute>
              <ConversationDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <>
              <Header />
              <div className="app-content">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/logout" element={<Logout />} />
                  <Route path="/opportunities" element={<PublicRequests />} />
                  <Route path="/videos" element={<VideoList />} />
                  <Route path="/video_display/stream/:video_id" element={<VideoList />} />
                  <Route path="/profile/developers/:id/public" element={<DeveloperProfileView />} />
                  <Route path="/creators" element={<PublicDevelopers />} />
                  <Route
                    path="/subscription/success"
                    element={<SubscriptionSuccess />}
                  />
                  <Route
                    path="/subscription/success"
                    element={<SubscriptionSuccess />}
                  />
                  {/* Marketplace routes */}
                  <Route
                    path="/marketplace"
                    element={
                      <ProtectedRoute>
                        <ProductList />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/marketplace/products/:productId"
                    element={
                      <ProtectedRoute>
                        <ProductDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/marketplace/upload"
                    element={
                      <ProtectedRoute userType="developer">
                        <ProductUpload />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/marketplace/purchase/success"
                    element={
                      <ProtectedRoute>
                        <SubscriptionSuccess />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agreements/request/:requestId"
                    element={
                      <ProtectedRoute userType="developer">
                        <ProjectAgreementView />
                      </ProtectedRoute>
                    }
                  />
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
                    path="/app-dashboard"
                    element={
                      <ProtectedRoute>
                        <AppDashboard />
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
                    path="/profile"
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
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <Footer />
            </>
          }
        />
      </Routes>
    </>
  );
}
function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app-wrapper" style={{ backgroundColor: 'var(--color-background-main)' }}>
          <AppContent />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
