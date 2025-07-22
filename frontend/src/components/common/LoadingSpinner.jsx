import React from 'react';

const LoadingSpinner = ({ text = 'Loading...', style = {} }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      ...style
    }}>
      <div style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        border: '3px solid rgba(255,255,255,.3)',
        borderRadius: '50%',
        borderTopColor: '#a78bfa',
        animation: 'spin 1s ease-in-out infinite',
        marginRight: '10px'
      }}></div>
      <span>{text}</span>
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
