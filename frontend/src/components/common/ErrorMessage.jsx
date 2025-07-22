import React from 'react';

const ErrorMessage = ({ message, style = {} }) => {
  if (!message) return null;
  
  return (
    <div 
      className="error-message" 
      style={{ 
        color: '#e74c3c', 
        backgroundColor: '#fdf2f2', 
        padding: '10px', 
        borderRadius: '4px', 
        marginBottom: '15px',
        border: '1px solid #e74c3c',
        ...style
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
