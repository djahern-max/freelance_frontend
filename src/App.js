import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/pages/HomePage";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Register from "./components/auth/Register";
import Email from "./components/auth/Email";
import VideoUpload from "./components/pages/VideoUpload";
import NewsletterDashboard from "./components/dashboards/NewsletterDashboard";
import CollaborationDashboard from "./components/dashboards/CollaborationDashboard";
// import TutorialsDashboard from "./components/dashboards/TutorialsDashboard";
// import PodcastsDashboard from "./components/dashboards/PodcastsDashboard";
import AppDashboard from "./components/dashboards/AppDashboard";
import NotesDashboard from "./components/dashboards/NotesDashboard";
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
        <Route path="/email" element={<Email />} />
        <Route path="/newsletter-dashboard" element={<NewsletterDashboard />} />

        {/* Protected routes */}
        <Route
          path="/collaboration-dashboard"
          element={
            <ProtectedRoute>
              <CollaborationDashboard />
            </ProtectedRoute>
          }
        />
        {/* <Route
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
        /> */}

        <Route path="/app-dashboard" element={<AppDashboard />} />
        <Route path="/notes-dashboard" element={<NotesDashboard />} />
        <Route
          path="/video-upload"
          element={
            <ProtectedRoute>
              <VideoUpload />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
