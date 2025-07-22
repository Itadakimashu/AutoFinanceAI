import React from 'react';

const Input = ({ 
  label, 
  error, 
  id,
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  required = false,
  disabled = false,
  style = {},
  ...props 
}) => {
  const inputId = id || `input-${Date.now()}-${Math.random()}`;

  const inputStyles = {
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${error ? '#e74c3c' : '#475569'}`,
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#334155',
    color: 'white',
    transition: 'border-color 0.2s ease',
    outline: 'none',
    ...style
  };

  const labelStyles = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    color: error ? '#e74c3c' : '#d8b4fe',
    fontWeight: '500'
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      {label && (
        <label htmlFor={inputId} style={labelStyles}>
          {label} {required && <span style={{ color: '#e74c3c' }}>*</span>}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={inputStyles}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = '#a78bfa';
          }
        }}
        onBlur={(e) => {
          if (!error) {
            e.target.style.borderColor = '#475569';
          }
        }}
        {...props}
      />
      {error && (
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: '#e74c3c'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
