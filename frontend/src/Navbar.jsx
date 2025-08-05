import React from 'react';
import { useAuth } from './AuthContext';
import ProfileDropdown from './components/ProfileDropdown';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  
  const navigateTo = (hash) => {
    window.location.hash = hash;
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
            <ProfileDropdown />
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
