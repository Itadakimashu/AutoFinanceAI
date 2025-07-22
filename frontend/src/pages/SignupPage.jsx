import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import { navigateTo } from '../utils/helpers';
import '../Auth.css';

const SignupPage = () => {
  const handleSwitchToLogin = () => {
    navigateTo('#login');
  };

  return (
    <SignupForm onSwitchToLogin={handleSwitchToLogin} />
  );
};

export default SignupPage;
