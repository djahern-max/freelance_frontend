// index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import './index.css';
import { store } from './redux/store';
// src/index.js
import './styles/variables.module.css';  // Import variables first
import './styles/global.css';            // Then global styles
import './index.css';

// Create a root
const container = document.getElementById('root');
const root = createRoot(container);

// Render your app
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
