import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'medium',
  style = {},
  ...props 
}) => {
  const baseStyles = {
    border: 'none',
    borderRadius: '6px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    opacity: disabled || loading ? 0.6 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const variants = {
    primary: {
      backgroundColor: '#a78bfa',
      color: 'white',
      '&:hover': {
        backgroundColor: '#9333ea'
      }
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#a78bfa',
      border: '1px solid #a78bfa',
      '&:hover': {
        backgroundColor: '#a78bfa',
        color: 'white'
      }
    },
    danger: {
      backgroundColor: '#e74c3c',
      color: 'white',
      '&:hover': {
        backgroundColor: '#c0392b'
      }
    }
  };

  const sizes = {
    small: {
      padding: '6px 12px',
      fontSize: '12px'
    },
    medium: {
      padding: '10px 16px',
      fontSize: '14px'
    },
    large: {
      padding: '12px 20px',
      fontSize: '16px'
    }
  };

  const buttonStyles = {
    ...baseStyles,
    ...variants[variant],
    ...sizes[size],
    ...style
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={buttonStyles}
      {...props}
    >
      {loading && (
        <div style={{
          width: '14px',
          height: '14px',
          border: '2px solid rgba(255,255,255,.3)',
          borderRadius: '50%',
          borderTopColor: 'white',
          animation: 'spin 1s ease-in-out infinite'
        }}></div>
      )}
      {children}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
};

export default Button;
