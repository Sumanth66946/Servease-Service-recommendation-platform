import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ProviderLoginPage from './pages/ProviderLoginPage';
import ProviderHomePage from './pages/ProviderHomePage';

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    localStorage.removeItem('token');
  };

  const handleProviderLogin = (providerData) => {
    setProvider(providerData);
    setCurrentPage('providerhome');
  };

  const handleProviderLogout = () => {
    setProvider(null);
    setCurrentPage('login');
    localStorage.removeItem('providerToken');
  };

  if (currentPage === 'login') return (
    <LoginPage
      onLogin={handleLogin}
      onProviderClick={() => setCurrentPage('providerlogin')}
    />
  );
  if (currentPage === 'providerlogin') return (
    <ProviderLoginPage
      onProviderLogin={handleProviderLogin}
      onBack={() => setCurrentPage('login')}
    />
  );
  if (currentPage === 'home') return <HomePage user={user} onLogout={handleLogout} />;
  if (currentPage === 'providerhome') return <ProviderHomePage provider={provider} onLogout={handleProviderLogout} />;
}

export default App;