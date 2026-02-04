
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global shim for process.env to ensure compatibility with sandbox environments
// and libraries that expect node-like environment variables.
(window as any).process = {
  env: {
    NODE_ENV: 'development',
    API_KEY: (window as any).process?.env?.API_KEY || '',
  },
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
