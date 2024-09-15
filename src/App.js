import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/pages/HomePage"; // Adjusted path for Homepage.js
import LoginPage from "./components/pages/LoginPage";
import Register from "./components/auth/Register"; // Adjusted path for Register.js

import NewsletterPage from "./components/pages/NewsletterPage"; // New page for newsletters
import TutorialsPage from "./components/pages/TutorialsPage"; // New page for learning
import PostsPage from "./components/pages/PostsPage"; // New page for posts

function App() {
  return (
    <Router>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />

        {/* New routes for Features cards */}
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/tutorials" element={<TutorialsPage />} />
        <Route path="/posts" element={<PostsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
