import React, { useState } from 'react';
import Button from './common/Button';
import ErrorMessage from './common/ErrorMessage';
import SuccessMessage from './common/SuccessMessage';
import { CATEGORIES } from '../utils/constants';

const TransactionRow = ({ 
  index, 
  transaction, 
  onChange, 
  onRemove, 
  showRemove = true,
  error 
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.5fr 2fr 1fr 80px 40px',
      gap: '12px',
      alignItems: 'center',
      padding: '12px',
      backgroundColor: '#2a254a',
      borderRadius: '8px',
      border: '1px solid #475569',
      marginBottom: '12px'
    }}>
      <input
        type="date"
        name="date"
        value={transaction.date}
        onChange={(e) => onChange(index, e)}
        required
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.date ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: '#334155',
          color: 'white',
          fontSize: '14px'
        }}
      />

      <select
        name="category"
        value={transaction.category}
        onChange={(e) => onChange(index, e)}
        required
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.category ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: '#334155',
          color: 'white',
          fontSize: '14px'
        }}
      >
        <option value="">Select Category</option>
        {CATEGORIES.map(category => (
          <option key={category.value} value={category.value}>
            {category.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        name="description"
        placeholder="Description"
        value={transaction.description}
        onChange={(e) => onChange(index, e)}
        required
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.description ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: '#334155',
          color: 'white',
          fontSize: '14px'
        }}
      />

      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={transaction.amount}
        onChange={(e) => onChange(index, e)}
        required
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.amount ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: '#334155',
          color: 'white',
          fontSize: '14px'
        }}
      />

      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        color: '#d8b4fe',
        fontSize: '12px',
        cursor: 'pointer'
      }}>
        <input
          type="checkbox"
          name="is_recurring"
          checked={transaction.is_recurring}
          onChange={(e) => onChange(index, e)}
          style={{ marginRight: '4px' }}
        />
        Recurring
      </label>

      {showRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          style={{
            padding: '6px',
            border: '1px solid #e74c3c',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: '#e74c3c',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#e74c3c';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#e74c3c';
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};

const MultiTransactionForm = ({ onSave, onCancel }) => {
  const [transactions, setTransactions] = useState([
    {
      date: '',
      category: '',
      description: '',
      amount: '',
      is_recurring: false
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const newTransactions = [...transactions];
    newTransactions[index] = {
      ...newTransactions[index],
      [name]: type === 'checkbox' ? checked : value
    };
    setTransactions(newTransactions);

    // Clear specific field error when user starts typing
    if (errors[index]?.[name]) {
      const newErrors = [...errors];
      if (newErrors[index]) {
        delete newErrors[index][name];
        setErrors(newErrors);
      }
    }
  };

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      {
        date: '',
        category: '',
        description: '',
        amount: '',
        is_recurring: false
      }
    ]);
  };

  const removeTransaction = (index) => {
    if (transactions.length > 1) {
      const newTransactions = transactions.filter((_, i) => i !== index);
      const newErrors = errors.filter((_, i) => i !== index);
      setTransactions(newTransactions);
      setErrors(newErrors);
    }
  };

  const validateTransactions = () => {
    const newErrors = [];
    let hasErrors = false;

    transactions.forEach((transaction, index) => {
      const transactionErrors = {};
      
      if (!transaction.date) {
        transactionErrors.date = 'Date is required';
        hasErrors = true;
      }
      if (!transaction.category) {
        transactionErrors.category = 'Category is required';
        hasErrors = true;
      }
      if (!transaction.description.trim()) {
        transactionErrors.description = 'Description is required';
        hasErrors = true;
      }
      if (!transaction.amount || parseFloat(transaction.amount) <= 0) {
        transactionErrors.amount = 'Valid amount is required';
        hasErrors = true;
      }

      newErrors[index] = transactionErrors;
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleSave = async () => {
    setGeneralError('');
    setSuccess('');

    if (!validateTransactions()) {
      setGeneralError('Please fix all validation errors before saving.');
      return;
    }

    setLoading(true);

    try {
      await onSave(transactions);
      setSuccess(`Successfully saved ${transactions.length} transaction(s)!`);
      
      setTimeout(() => {
        // Reset form or redirect
        setTransactions([
          {
            date: '',
            category: '',
            description: '',
            amount: '',
            is_recurring: false
          }
        ]);
        setErrors([]);
        setSuccess('');
      }, 1500);
    } catch (error) {
      setGeneralError('Failed to save transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #475569'
      }}>
        <h2 style={{
          color: '#d8b4fe',
          marginBottom: '24px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Add Transactions
        </h2>

        <ErrorMessage message={generalError} />
        <SuccessMessage message={success} />

        {/* Header Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr 2fr 1fr 80px 40px',
          gap: '12px',
          padding: '12px',
          marginBottom: '12px',
          fontSize: '14px',
          fontWeight: '600',
          color: '#94a3b8'
        }}>
          <div>Date</div>
          <div>Category</div>
          <div>Description</div>
          <div>Amount (BDT)</div>
          <div>Recurring</div>
          <div></div>
        </div>

        {/* Transaction Rows */}
        {transactions.map((transaction, index) => (
          <TransactionRow
            key={index}
            index={index}
            transaction={transaction}
            onChange={handleChange}
            onRemove={removeTransaction}
            showRemove={transactions.length > 1}
            error={errors[index]}
          />
        ))}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '20px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Button
            onClick={addTransaction}
            variant="secondary"
            disabled={loading}
          >
            + Add Another Transaction
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={onCancel}
              variant="secondary"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={loading}
            >
              Save All Transactions ({transactions.length})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiTransactionForm;
