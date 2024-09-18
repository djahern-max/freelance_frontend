import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/pages/HomePage";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Register from "./components/auth/Register";
import NewsletterPage from "./components/pages/NewsletterPage";
import TutorialsPage from "./components/pages/TutorialsPage";
import PostsPage from "./components/pages/PostsPage";
import CollaborationDashboard from "./components/dashboards/CollaborationDashboard";
import TutorialsDashboard from "./components/dashboards/TutorialsDashboard";
import PodcastsDashboard from "./components/dashboards/PodcastsDashboard";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./global.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* New routes for Features cards */}
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        <Route path="/posts" element={<PostsPage />} />

        {/* Protected routes */}
        <Route
          path="/collaboration-dashboard"
          element={
            <ProtectedRoute>
              <CollaborationDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tutorials-dashboard"
          element={
            <ProtectedRoute>
              <TutorialsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/podcasts-dashboard"
          element={
            <ProtectedRoute>
              <PodcastsDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
