import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import './components/theme.css'; // Import our new theme CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);