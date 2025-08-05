import React from 'react';
import { useAuth } from '../../AuthContext';
import ProfileDropdown from '../ProfileDropdown';
import '../../Navbar.css';

const Logo = ({ onClick }) => {
  return (
    <div className="logo" onClick={onClick} style={{ cursor: 'pointer' }}>
      <span className="logo-bold">AutoFinance</span>
      <span className="logo-accent">AI</span>
    </div>
  );
};

const NavButton = ({ onClick, children, variant = 'default' }) => {
  const baseClass = 'nav-btn';
  const variantClass = variant === 'signup' ? 'signup-btn' : variant === 'logout' ? 'logout-btn' : '';
  const className = `${baseClass} ${variantClass}`.trim();

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

const UserWelcome = ({ user }) => {
  return (
    <span className="user-welcome">
      Welcome, {user?.first_name || user?.email}
    </span>
  );
};

const Navigation = () => {
  const { isAuthenticated } = useAuth();
  
  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Logo onClick={() => navigateTo('#home')} />
      </div>

      <div className="navbar-right">
        <NavButton onClick={() => navigateTo('#home')}>
          Home
        </NavButton>
        
        {isAuthenticated ? (
          <>
            <NavButton onClick={() => navigateTo('#transactions')}>
              Transactions
            </NavButton>
            <NavButton onClick={() => navigateTo('#analysis')}>
              Analysis
            </NavButton>
            <ProfileDropdown />
          </>
        ) : (
          <>
            <NavButton onClick={() => navigateTo('#login')}>
              Login
            </NavButton>
            <NavButton onClick={() => navigateTo('#signup')} variant="signup">
              Sign Up
            </NavButton>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
