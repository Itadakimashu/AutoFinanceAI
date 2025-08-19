import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    // Use username first two letters if available
    if (user?.username) {
      return user.username.length > 1 
        ? user.username.substring(0, 2).toUpperCase()
        : user.username[0].toUpperCase();
    }
    // Use first and last name initials if both are available
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    // Use first name initial + first letter of email if only first name is available
    if (user?.first_name && user?.email) {
      return `${user.first_name[0]}${user.email[0]}`.toUpperCase();
    }
    // Use first name initial only if available
    if (user?.first_name) {
      return user.first_name[0].toUpperCase();
    }
    // Use last name initial + first letter of email if only last name is available
    if (user?.last_name && user?.email) {
      return `${user.last_name[0]}${user.email[0]}`.toUpperCase();
    }
    // Use last name initial only if available
    if (user?.last_name) {
      return user.last_name[0].toUpperCase();
    }
    // Use email first two letters if available
    if (user?.email) {
      return user.email.length > 1 
        ? user.email.substring(0, 2).toUpperCase()
        : user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    // Prioritize username first
    if (user?.username) {
      return user.username;
    }
    // Fallback to first and last name combination
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    // Show first name only if available
    if (user?.first_name) {
      return user.first_name;
    }
    // Show last name only if available
    if (user?.last_name) {
      return user.last_name;
    }
    // Final fallback to email
    return user?.email || 'User';
  };

  return (
    <>
      <div className="profile-dropdown" ref={dropdownRef}>
        <div 
          className="profile-avatar" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="avatar-circle">
            {getInitials()}
          </div>
          <span className="dropdown-arrow">▼</span>
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-header">
              <div className="avatar-circle large">
                {getInitials()}
              </div>
              <div className="user-info">
                <h4>{getDisplayName()}</h4>
                <p>{user?.email}</p>
              </div>
            </div>
            
            <div className="dropdown-divider"></div>
            
            <div className="dropdown-items">
              <button 
                className="dropdown-item"
                onClick={() => {
                  setShowProfileModal(true);
                  setIsOpen(false);
                }}
              >
                <span className="dropdown-icon">👤</span>
                Edit Profile
              </button>
              
              <button 
                className="dropdown-item"
                onClick={() => {
                  setShowPasswordModal(true);
                  setIsOpen(false);
                }}
              >
                <span className="dropdown-icon">🔒</span>
                Change Password
              </button>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item logout"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
              >
                <span className="dropdown-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <ProfileEditModal 
          user={user}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal 
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
};

// Profile Edit Modal Component
const ProfileEditModal = ({ user, onClose }) => {
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://autofinanceai.onrender.com/api/user/update/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        onClose();
      } else {
        const errorData = await response.json();
        
        // Handle different types of backend errors
        let errorMessage = '';
        
        if (errorData.detail) {
          // Single error message
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          // Non-field errors array
          errorMessage = errorData.non_field_errors.join(', ');
        } else if (errorData.email || errorData.first_name || errorData.last_name) {
          // Field-specific errors
          const fieldErrors = [];
          if (errorData.email) fieldErrors.push(`Email: ${Array.isArray(errorData.email) ? errorData.email.join(', ') : errorData.email}`);
          if (errorData.first_name) fieldErrors.push(`First Name: ${Array.isArray(errorData.first_name) ? errorData.first_name.join(', ') : errorData.first_name}`);
          if (errorData.last_name) fieldErrors.push(`Last Name: ${Array.isArray(errorData.last_name) ? errorData.last_name.join(', ') : errorData.last_name}`);
          errorMessage = fieldErrors.join('; ');
        } else if (errorData.message) {
          // Custom message field
          errorMessage = errorData.message;
        } else {
          // Fallback to stringify the error object
          errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
        }
        
        setError(errorMessage || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Change Password Modal Component
const ChangePasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    re_new_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.new_password !== formData.re_new_password) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://autofinanceai.onrender.com/auth/users/set_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorData = await response.json();
        
        // Handle different types of backend errors
        let errorMessage = '';
        
        if (errorData.detail) {
          // Single error message
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          // Non-field errors array
          errorMessage = errorData.non_field_errors.join(', ');
        } else if (errorData.current_password || errorData.new_password || errorData.re_new_password) {
          // Field-specific errors
          const fieldErrors = [];
          if (errorData.current_password) fieldErrors.push(`Current Password: ${Array.isArray(errorData.current_password) ? errorData.current_password.join(', ') : errorData.current_password}`);
          if (errorData.new_password) fieldErrors.push(`New Password: ${Array.isArray(errorData.new_password) ? errorData.new_password.join(', ') : errorData.new_password}`);
          if (errorData.re_new_password) fieldErrors.push(`Confirm Password: ${Array.isArray(errorData.re_new_password) ? errorData.re_new_password.join(', ') : errorData.re_new_password}`);
          errorMessage = fieldErrors.join('; ');
        } else if (errorData.message) {
          // Custom message field
          errorMessage = errorData.message;
        } else {
          // Fallback to stringify the error object
          errorMessage = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
        }
        
        setError(errorMessage || 'Failed to change password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content success" onClick={(e) => e.stopPropagation()}>
          <div className="success-message">
            <span className="success-icon">✅</span>
            <h3>Password Changed Successfully!</h3>
            <p>Your password has been updated.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Change Password</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={formData.re_new_password}
              onChange={(e) => setFormData({ ...formData, re_new_password: e.target.value })}
              required
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="save-btn">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileDropdown;
