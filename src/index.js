import React from "react";
import ReactDOM from "react-dom/client"; // Note: This should be 'react-dom/client' in React 18+
import "./global.css"; // Ensure this file exists and the path is correct
import App from "./App";
import reportWebVitals from "./reportWebVitals"; // Import reportWebVitals

// Create the root using React 18's createRoot API
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Start measuring performance (optional)
reportWebVitals();
