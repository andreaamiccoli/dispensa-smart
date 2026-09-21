import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { registerServiceWorker } from './sw-register.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Registra il service worker per l'offline e installabilità PWA
registerServiceWorker();
