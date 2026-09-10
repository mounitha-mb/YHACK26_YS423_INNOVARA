import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import LoginPage from './components/LoginPage.jsx';
import './index.css';

function Root() {
  const [user, setUser] = useState(() => sessionStorage.getItem('cf_user') || null);

  const handleLoginSuccess = (email) => {
    sessionStorage.setItem('cf_user', email);
    setUser(email);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cf_user');
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <App user={user} onLogout={handleLogout} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
