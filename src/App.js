import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./redux/store";
import { login } from "./redux/authSlice";
import Home from "./components/pages/HomePage";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Register from "./components/auth/Register";
import PublicRequests from "./components/requests/PublicRequests";
import VideoUpload from "./components/videos/VideoUpload";
import Videos from "./components/dashboards/Videos";
import ClientDashboard from "./components/dashboards/ClientDashboard";
import DeveloperDashboard from "./components/dashboards/DeveloperDashboard";
import ConversationsList from "./components/conversations/ConversationsList";
import ConversationDetail from "./components/conversations/ConversationDetail";
import RequestDetails from "./components/conversations/RequestDetails"; // Updated back to conversations
import RequestResponses from "./components/conversations/RequestResponses"; // Updated back to conversations
import AppDashboard from "./components/dashboards/AppDashboard";
import Requests from "./components/requests/Request";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CreateProject from "./components/projects/CreateProject";
import ProjectDetails from "./components/projects/ProjectDetails";
import api from "./utils/api";
import "./styles/global.css";

// AppContent component - this stays in the same file
function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      console.log("Checking auth with token:", token);

      api
        .get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          console.log("User data received:", response.data);
          dispatch(
            login({
              token,
              user: {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email,
                fullName: response.data.full_name,
                isActive: response.data.is_active,
                userType: response.data.user_type, // Note this change
                createdAt: response.data.created_at,
              },
            })
          );
        })
        .catch((error) => {
          console.error("Auth check failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });
    }
  }, [dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/public-requests" element={<PublicRequests />} />

      {/* Legacy app dashboard route */}
      <Route
        path="/app-dashboard"
        element={
          <ProtectedRoute>
            <AppDashboard />
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

      {/* Developer-specific routes */}
      <Route
        path="/developer-dashboard"
        element={
          <ProtectedRoute userType="developer">
            <DeveloperDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shared protected routes */}
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/videos"
        element={
          <ProtectedRoute>
            <Videos />
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

      {/* Dashboard redirect based on user type */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {({ user }) => (
              <Navigate
                to={
                  user.userType === "client"
                    ? "/client-dashboard"
                    : "/developer-dashboard"
                }
                replace
              />
            )}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

// Main App component
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
