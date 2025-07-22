import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { navigateTo } from '../utils/helpers';
import '../Auth.css';

const LoginPage = () => {
  const handleSwitchToSignup = () => {
    navigateTo('#signup');
  };

  return (
    <LoginForm onSwitchToSignup={handleSwitchToSignup} />
  );
};

export default LoginPage;
