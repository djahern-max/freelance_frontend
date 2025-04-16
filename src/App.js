import React, { useEffect, Suspense } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
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
import OAuthSuccess from './components/auth/OAuthSuccess';
import OAuthError from './components/auth/OAuthError';
import CollaborationPortal from './components/collaboration/CollaborationPortal';
// Import session manager
import { initSessionManager, stopSessionManager } from './utils/sessionManager';

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
const SharedPlaylist = React.lazy(() => import('./components/videos/SharedPlayLists'));
const ShowcaseList = React.lazy(() => import('./components/showcase/ShowcaseList'));
const ShowcaseForm = React.lazy(() => import('./components/showcase/ShowcaseForm'));
const SharedShowcase = React.lazy(() => import('./components/showcase/SharedShowcase'));
const EditShowcaseForm = React.lazy(() => import('./components/showcase/EditShowcaseForm'));
const DonationSuccess = React.lazy(() => import('./components/payments/DonationSuccess'));
const DonationCancel = React.lazy(() => import('./components/payments/DonationCancel'));
const TermsOfServicePage = React.lazy(() => import('./components/legal/TermsOfServicePage'));
const PrivacyPolicyPage = React.lazy(() => import('./components/legal/PrivacyPolicyPage'));
const OAuthCallback = React.lazy(() => import('./components/auth/OAuthCallback'));
const SelectRole = React.lazy(() => import('./components/auth/SelectRole'));
const PlaylistDetail = React.lazy(() => import('./components/videos/PlaylistDetail'));
const DeveloperVideos = React.lazy(() => import('./components/videos/DeveloperVideos'));
const MyPlaylists = React.lazy(() => import('./components/videos/MyPlaylists'));
const CreatePlaylistForm = React.lazy(() => import('./components/videos/CreatePlayListForm'));


const LoadingFallback = () => (
  <div className="loading-spinner">Loading...</div>
);

function AppContent() {
  const dispatch = useDispatch();
  // Get authentication state
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  // Session management
  useEffect(() => {
    let cleanupFunction;

    // Only initialize session management when user is logged in
    if (isAuthenticated) {
      console.log('Initializing session manager');
      cleanupFunction = initSessionManager();
    }

    // Clean up when component unmounts or auth state changes
    return () => {
      if (cleanupFunction) {
        cleanupFunction();
      }
      stopSessionManager();
    };
  }, [isAuthenticated]);

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
            googleId: response.data.google_id,
            githubId: response.data.github_id,
            linkedinId: response.data.linkedin_id
          },
        }));
      } catch (error) {
        if (error.name === 'AbortError') return;
        localStorage.removeItem('token');
        // Don't remove OAuth IDs here
      }
    };

    checkAuth();
    return () => controller.abort();
  }, [dispatch]);

  // 🔹 New useEffect for Google, GitHub, or LinkedIn Authentication
  useEffect(() => {
    const googleId = localStorage.getItem("google_id");
    const githubId = localStorage.getItem("github_id");
    const linkedinId = localStorage.getItem("linkedin_id");

    if (!googleId && !githubId && !linkedinId) return;

    const fetchUserByOAuthId = async () => {
      try {
        // Choose the provider and ID that exists
        const params = {};
        if (googleId) params.google_id = googleId;
        if (githubId) params.github_id = githubId;
        if (linkedinId) params.linkedin_id = linkedinId;

        const response = await api.get("/auth/get-user", { params });

        const userData = response.data;
        if (!userData) throw new Error("User not found");

        dispatch(
          login({
            user: {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              fullName: userData.full_name,
              isActive: userData.is_active,
              userType: userData.user_type,
              createdAt: userData.created_at,
            },
          })
        );

        // Check if user needs to select a role (if user_type is null or empty)
        if (!userData.user_type || userData.needs_role_selection) {
          // Redirect to role selection page
          window.location.href = '/select-role';
        } else {
          // Otherwise redirect based on existing role
          const dashboardPath =
            userData.user_type === "client" ? "/client-dashboard" : "/developer-dashboard";
          window.location.href = dashboardPath;
        }
      } catch (error) {
        console.error("OAuth-based authentication failed", error);

        // Clear OAuth IDs from localStorage
        localStorage.removeItem("google_id");
        localStorage.removeItem("github_id");
        localStorage.removeItem("linkedin_id");

        // Don't redirect to login here - just clear the localStorage
        // This prevents a potential redirect loop
      }
    };

    fetchUserByOAuthId();
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

            <Route path="/oauth-callback" element={<OAuthCallback />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route path="/oauth-error" element={<OAuthError />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/tickets" element={<PublicRequests />} />
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
            <Route path="/select-role" element={<SelectRole />} />
            <Route path="/videos" element={<VideoList />} />
            <Route path="/video-upload" element={<VideoUpload />} />
            <Route path="/playlists" element={<MyPlaylists />} />
            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
            <Route path="/create-playlist" element={<CreatePlaylistForm />} />
            <Route path="/shared/playlists/:shareToken" element={<SharedPlaylist />} />

            {/* Fixed the collaboration route - removed extra backslash */}
            <Route path="/collaboration/:sessionId/:accessToken" element={<CollaborationPortal />} />

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

            <Route path="/playlists/:playlistId" element={<PlaylistDetail />} />
            <Route path="/developers/:developerId/videos" element={<DeveloperVideos />} />

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

export default App;