import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/pages/HomePage";
import Login from "./components/auth/Login";
import Logout from "./components/auth/Logout";
import Register from "./components/auth/Register";
import Email from "./components/auth/Email";
import VideoUpload from "./components/pages/VideoUpload";
import Videos from "./components/dashboards/Videos";
import NewsletterDashboard from "./components/dashboards/NewsletterDashboard";
import CommandNotes from "./components/pages/CommandNotes";
import AppDashboard from "./components/dashboards/AppDashboard";
import Notes from "./components/pages/Notes";
import ProtectedRoute from "./components/common/ProtectedRoute";
import CreateProject from "./components/pages/CreateProject";
import "./global.css";

function App() {
  console.log("API URL:", process.env.REACT_APP_API_URL);
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
          path="/app-dashboard"
          element={
            <ProtectedRoute>
              <AppDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <Notes />
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
        />{" "}
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
          path="/videos"
          element={
            <ProtectedRoute>
              <Videos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/command-notes"
          element={
            <ProtectedRoute>
              <CommandNotes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
