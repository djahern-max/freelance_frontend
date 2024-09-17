import React from "react";
import ReactDOM from "react-dom/client"; // Ensure correct import for React 18+
import { Provider } from "react-redux"; // Import Provider from react-redux
import { store } from "./redux/store"; // Import the Redux store you created
import "./global.css"; // Ensure this file exists and the path is correct
import App from "./App";
import reportWebVitals from "./reportWebVitals"; // Import reportWebVitals

// Create the root using React 18's createRoot API
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      {" "}
      {/* Wrap the App with Provider */}
      <App />
    </Provider>
  </React.StrictMode>
);

// Start measuring performance (optional)
reportWebVitals();
