import React from 'react';
import { useAuth } from './AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  
  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo" onClick={() => navigateTo('#home')}>
          <span className="logo-bold">AutoFinance</span><span className="logo-accent">AI</span>
        </div>
      </div>

      <div className="navbar-right">
        <button onClick={() => navigateTo('#home')} className="nav-btn">Home</button>
        
        {isAuthenticated ? (
          <>
            <button onClick={() => navigateTo('#transactions')} className="nav-btn">Transactions</button>
            <span className="user-welcome">Welcome, {user?.first_name || user?.email}</span>
            <button onClick={handleLogout} className="nav-btn logout-btn">Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => navigateTo('#login')} className="nav-btn">Login</button>
            <button onClick={() => navigateTo('#signup')} className="nav-btn signup-btn">Sign Up</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
