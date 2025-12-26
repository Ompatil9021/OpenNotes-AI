import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // 1. Import this
import { AuthProvider } from './context/AuthContext'; // 2. Import Auth Context

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 3. Router MUST be the top parent */}
      <AuthProvider> {/* 4. Auth Provider inside Router */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);