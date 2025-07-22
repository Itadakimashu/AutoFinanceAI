import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';
import AuthCard from './AuthCard';
import Input from '../common/Input';
import Button from '../common/Button';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';

const SignupForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register } = useAuth();

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
    setSuccess(false);

    try {
      const result = await register(formData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(typeof result.error === 'object' ? 
          Object.values(result.error).flat().join(', ') : 
          result.error
        );
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Join AutoFinanceAI" 
      subtitle="Create your account to get started"
    >
      <form onSubmit={handleSubmit}>
        <ErrorMessage message={error} />
        <SuccessMessage message={success ? "Account created successfully! Redirecting to login..." : ""} />
        
        <Input
          label="Username"
          name="username"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="First Name"
          name="first_name"
          placeholder="Enter your first name"
          value={formData.first_name}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="Last Name"
          name="last_name"
          placeholder="Enter your last name"
          value={formData.last_name}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password"
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
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <div className="auth-footer">
        <p>
          Already have an account?
          <a href="#login" onClick={onSwitchToLogin}> Sign in</a>
        </p>
      </div>
    </AuthCard>
  );
};

export default SignupForm;
