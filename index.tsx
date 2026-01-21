
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const mountNode = document.getElementById('root');
if (mountNode) {
  const root = ReactDOM.createRoot(mountNode);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
