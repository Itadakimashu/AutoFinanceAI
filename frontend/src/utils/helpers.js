// Navigation utilities
export const navigateTo = (hash) => {
  window.location.hash = hash;
};

export const getCurrentView = () => {
  return window.location.hash || '#home';
};

// Form utilities
export const handleFormChange = (e, setFormData) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};

// Error formatting utilities
export const formatError = (error) => {
  if (typeof error === 'object') {
    return Object.values(error).flat().join(', ');
  }
  return error;
};

// Date utilities
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Amount utilities
export const formatAmount = (amount) => {
  if (!amount) return '0';
  return parseFloat(amount).toLocaleString();
};

// Validation utilities
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateRequired = (value) => {
  return value && value.toString().trim().length > 0;
};
