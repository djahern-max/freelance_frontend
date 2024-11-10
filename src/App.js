import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "./redux/authSlice"; // Import login action
import Home from "./components/pages/HomePage";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Register from "./components/auth/Register";
import PublicRequests from "./components/pages/PublicRequests";
import VideoUpload from "./components/pages/VideoUpload";
import Videos from "./components/dashboards/Videos";
import ConversationsList from "./components/conversations/ConversationsList";
import ConversationDetail from "./components/conversations/ConversationDetail";
import RequestResponses from "./components/conversations/RequestResponses";
import AppDashboard from "./components/dashboards/AppDashboard";
import Requests from "./components/pages/Request";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CreateProject from "./components/pages/CreateProject";
import api from "./utils/api"; // Import your API instance
import "./styles/global.css";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (token) {
      // Verify token by calling /auth/me
      api
        .get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const userData = response.data;
          dispatch(
            login({
              token,
              username: userData.username,
              userId: userData.id.toString(),
            })
          );
        })
        .catch(() => {
          // If token is invalid, clear it
          localStorage.removeItem("authToken");
          localStorage.removeItem("userId");
          localStorage.removeItem("username");
        });
    }
  }, [dispatch]);

  console.log("API URL:", process.env.REACT_APP_API_URL);

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/public-requests" element={<PublicRequests />} />

        {/* Protected routes */}
        <Route
          path="/app-dashboard"
          element={
            <ProtectedRoute>
              <AppDashboard />
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
          path="/videos"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-project"
          element={
            <ProtectedRoute>
              <CreateProject />
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
      </Routes>
    </Router>
  );
}

export default App;
