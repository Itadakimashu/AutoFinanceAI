import { useState } from 'react';
import { handleFormChange } from '../utils/helpers';

export const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    handleFormChange(e, setFormData);
    // Clear error for the field being changed
    if (errors[e.target.name]) {
      setErrors(prev => ({
        ...prev,
        [e.target.name]: ''
      }));
    }
  };

  const setFieldError = (fieldName, error) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  const isValid = () => {
    return Object.values(errors).every(error => !error);
  };

  return {
    formData,
    setFormData,
    errors,
    handleChange,
    setFieldError,
    clearErrors,
    resetForm,
    isValid
  };
};
