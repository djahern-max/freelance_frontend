import React, { useEffect, Suspense } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast.css';
import './styles/global.css';

// Core components that are always needed
import Header from './components/shared/Header';
import Footer from './components/shared/Footer';
import Home from './components/pages/HomePage';
import ProtectedRoute from './components/common/ProtectedRoute';

import { login } from './redux/authSlice';
import { store } from './redux/store';
import api from './utils/api';
import MemoryMonitor from './utils/debug/MemoryMonitor';

// Lazy load all other components
const Login = React.lazy(() => import('./components/auth/Login'));
const Logout = React.lazy(() => import('./components/auth/Logout'));
const Register = React.lazy(() => import('./components/auth/Register'));
const ConversationDetail = React.lazy(() => import('./components/conversations/ConversationDetail'));
const ConversationsList = React.lazy(() => import('./components/conversations/ConversationsList'));
const RequestDetails = React.lazy(() => import('./components/conversations/RequestDetails'));
const RequestResponses = React.lazy(() => import('./components/conversations/RequestResponses'));
const ClientDashboard = React.lazy(() => import('./components/dashboards/ClientDashboard'));
const DeveloperDashboard = React.lazy(() => import('./components/dashboards/DeveloperDashboard'));
const SubscriptionSuccess = React.lazy(() => import('./components/payments/SubscriptionSuccess'));
const PublicDevelopers = React.lazy(() => import('./components/profiles/PublicDevelopers'));
const CreateProject = React.lazy(() => import('./components/projects/CreateProject'));
const ProjectDetails = React.lazy(() => import('./components/projects/ProjectDetails'));
const ProjectsList = React.lazy(() => import('./components/projects/ProjectsList'));
const PublicRequests = React.lazy(() => import('./components/requests/PublicRequests'));
const Requests = React.lazy(() => import('./components/requests/Request'));
const Settings = React.lazy(() => import('./components/settings/Settings'));
const VideoList = React.lazy(() => import('./components/videos/VideoList'));
const VideoUpload = React.lazy(() => import('./components/videos/VideoUpload'));
const DeveloperProfileView = React.lazy(() => import('./components/profiles/DeveloperProfileView'));
const SharedVideo = React.lazy(() => import('./components/videos/SharedVideo'));
const ShowcaseList = React.lazy(() => import('./components/showcase/ShowcaseList'));
const ShowcaseForm = React.lazy(() => import('./components/showcase/ShowcaseForm'));
const SharedShowcase = React.lazy(() => import('./components/showcase/SharedShowcase'));
const EditShowcaseForm = React.lazy(() => import('./components/showcase/EditShowcaseForm'));
const DonationSuccess = React.lazy(() => import('./components/payments/DonationSuccess'));
const DonationCancel = React.lazy(() => import('./components/payments/DonationCancel'));
const TermsOfServicePage = React.lazy(() => import('./components/legal/TermsOfServicePage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/legal/PrivacyPolicyPage'));



const LoadingFallback = () => (
  <div className="loading-spinner">Loading...</div>
);

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem('token');

    const checkAuth = async () => {
      if (!token) return;

      try {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        dispatch(login({
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
        }));
      } catch (error) {
        if (error.name === 'AbortError') return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    };

    checkAuth();
    return () => controller.abort();
  }, [dispatch]);

  return (
    <>
      <Header />
      <div className="app-content">
        <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/shared/videos/:shareToken" element={<SharedVideo />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/donation/success" element={<DonationSuccess />} />
            <Route path="/donation/cancel" element={<DonationCancel />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

            {/* Showcase routes */}
            <Route
              path="/showcase"
              element={<ShowcaseList />}
            />
            <Route
              path="/showcase/new"
              element={
                <ProtectedRoute userType="developer" requiresSubscription={true}>
                  <ShowcaseForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/showcase/edit/:id"
              element={
                <ProtectedRoute userType="developer" requiresSubscription={true}>
                  <EditShowcaseForm />
                </ProtectedRoute>
              }
            />
            <Route path="/showcase/:id" element={<SharedShowcase />} />

            {/* Video routes */}
            <Route
              path="/video-upload"
              element={
                <ProtectedRoute>
                  <VideoUpload />
                </ProtectedRoute>
              }
            />

            {/* Client routes */}
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

            {/* Developer routes */}
            <Route
              path="/developer-dashboard"
              element={
                <ProtectedRoute userType="developer">
                  <DeveloperDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/conversations/:id"
              element={
                <ProtectedRoute>
                  <ConversationDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations"
              element={
                <ProtectedRoute>
                  <ConversationsList />
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

            {/* Dashboard redirect */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {({ user }) => (
                    <Navigate
                      to={user.userType === 'client' ? '/client-dashboard' : '/developer-dashboard'}
                      replace
                    />
                  )}
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={5}
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
    </>
  );
}

// Memoize the AppContent component with explicit comparison
const MemoizedAppContent = React.memo(AppContent, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
});

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app-wrapper" style={{ backgroundColor: 'var(--color-background-main)' }}>
          <MemoizedAppContent />
          {process.env.NODE_ENV === 'development' && <MemoryMonitor />}
        </div>
      </Router>
    </Provider>
  );
}

// Export without memory debugger to reduce overhead
export default App;