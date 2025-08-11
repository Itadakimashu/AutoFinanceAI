import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import AuthCard from './AuthCard';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';

const LoginForm = ({ onSwitchToSignup }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        window.location.hash = '#home';
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Welcome Back" 
      subtitle="Please sign in to your account"
    >
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        
        <Input
          label="Username"
          name="username"
          placeholder="Enter your username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Button 
          type="submit" 
          loading={loading}
          disabled={loading}
          style={{ width: '100%', marginBottom: '20px' }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      <div className="auth-footer">
        <p><a href="#">Forgot your password?</a></p>
        <p>
          Don't have an account?
          <a href="#signup" onClick={onSwitchToSignup}> Sign up</a>
        </p>
      </div>
    </AuthCard>
  );
};

export default LoginForm;
