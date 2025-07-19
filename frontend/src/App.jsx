import React, { useState, useEffect } from 'react';
import { AuthProvider } from './AuthContext';
import Navbar from './Navbar';
import Login from './Login';
import Signup from './Signup';
import Transactions from './Transactions';
import Home from './Home';
import './App.css';

function App() {
  const [view, setView] = useState(window.location.hash || '#home');

  useEffect(() => {
    const handleHashChange = () => {
      setView(window.location.hash || '#home');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (view) {
      case '#login':
        return <Login switchToSignup={() => (window.location.hash = '#signup')} />;
      case '#signup':
        return <Signup switchToLogin={() => (window.location.hash = '#login')} />;
      case '#transactions':
        return <Transactions />;
      case '#home':
      default:
        return <Home />; // ✅ Use the new Home component
    }
  };

  return (
    <AuthProvider>
      <Navbar />
      {renderPage()}
    </AuthProvider>
  );
}

export default App;
