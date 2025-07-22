import React, { useState, useEffect } from 'react';
import Modal from './common/Modal';
import Button from './common/Button';
import Input from './common/Input';
import ErrorMessage from './common/ErrorMessage';
import SuccessMessage from './common/SuccessMessage';
import { CATEGORIES } from '../utils/constants';
import { transactionsAPI } from '../api';

const TransactionDetailModal = ({ 
  isOpen, 
  onClose, 
  transaction, 
  onUpdate, 
  onDelete 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
    is_recurring: false
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date || '',
        category: transaction.category || '',
        description: transaction.description || '',
        amount: transaction.amount || '',
        is_recurring: transaction.is_recurring || false
      });
      // Reset editing state when a new transaction is opened
      setIsEditing(false);
      setError('');
      setSuccess('');
    }
  }, [transaction]);

  // Reset state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setError('');
      setSuccess('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    if (!transaction?.id) return;
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await transactionsAPI.updateTransaction(transaction.id, formData);
      setSuccess('Transaction updated successfully!');
      setIsEditing(false);
      
      // Call the onUpdate callback to refresh the transactions list
      if (onUpdate) {
        onUpdate();
      }
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (error) {
      setError('Failed to update transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction?.id) return;
    
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await transactionsAPI.deleteTransaction(transaction.id);
      
      // Call the onDelete callback to refresh the transactions list
      if (onDelete) {
        onDelete();
      }
      
      onClose();
    } catch (error) {
      setError('Failed to delete transaction');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (transaction) {
      setFormData({
        date: transaction.date || '',
        category: transaction.category || '',
        description: transaction.description || '',
        amount: transaction.amount || '',
        is_recurring: transaction.is_recurring || false
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!transaction) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? "Edit Transaction" : "Transaction Details"}
    >
      <ErrorMessage message={error} />
      <SuccessMessage message={success} />

      <div style={{ marginBottom: '20px' }}>
        {isEditing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#d8b4fe',
                fontWeight: '500'
              }}>
                Category <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#334155',
                  color: 'white',
                  marginBottom: '16px'
                }}
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <Input
              label="Amount (BDT)"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#d8b4fe',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={formData.is_recurring}
                  onChange={handleChange}
                  disabled={loading}
                  style={{ marginRight: '4px' }}
                />
                Recurring Transaction
              </label>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Date:</span>
              <span style={{ color: '#f3f4f6', fontWeight: '500' }}>{transaction.date}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Category:</span>
              <span style={{ 
                color: '#f3f4f6', 
                fontWeight: '500',
                textTransform: 'capitalize' 
              }}>
                {transaction.category}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Amount:</span>
              <span style={{ 
                color: '#f3f4f6', 
                fontWeight: '600',
                fontSize: '16px' 
              }}>
                {transaction.amount} BDT
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>Recurring:</span>
              <span style={{ color: '#f3f4f6' }}>
                {transaction.is_recurring ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px', display: 'block', marginBottom: '4px' }}>
                Description:
              </span>
              <p style={{ 
                color: '#f3f4f6', 
                margin: 0,
                padding: '8px',
                backgroundColor: '#334155',
                borderRadius: '4px',
                border: '1px solid #475569'
              }}>
                {transaction.description}
              </p>
            </div>
          </div>
        )}
      </div>

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end',
        marginTop: '24px'
      }}>
        {isEditing ? (
          <>
            <Button 
              variant="secondary" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              loading={loading}
              disabled={loading}
            >
              Save Changes
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="danger" 
              onClick={handleDelete}
              loading={loading}
              disabled={loading}
            >
              Delete
            </Button>
            <Button 
              onClick={() => setIsEditing(true)}
              disabled={loading}
            >
              Edit
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
};

export default TransactionDetailModal;
