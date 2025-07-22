import React from 'react';

const AuthCard = ({ children, title, subtitle }) => {
  return (
    <div className="auth-page">
      <div className="auth-card">
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export default AuthCard;
