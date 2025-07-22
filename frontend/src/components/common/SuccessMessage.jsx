import React from 'react';

const SuccessMessage = ({ message, style = {} }) => {
  if (!message) return null;
  
  return (
    <div 
      className="success-message" 
      style={{ 
        color: '#27ae60', 
        backgroundColor: '#f2fdf2', 
        padding: '10px', 
        borderRadius: '4px', 
        marginBottom: '15px',
        border: '1px solid #27ae60',
        ...style
      }}
    >
      {message}
    </div>
  );
};

export default SuccessMessage;
