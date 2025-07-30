import React, { useState } from 'react';
import Button from './common/Button';
import ErrorMessage from './common/ErrorMessage';
import SuccessMessage from './common/SuccessMessage';
import ReceiptUploader from './ReceiptUploader';
import { CATEGORIES } from '../utils/constants';

const TransactionRow = ({ 
  index, 
  transaction, 
  onChange, 
  onRemove, 
  showRemove = true,
  error,
  disabled = false
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
        disabled={disabled}
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.date ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: disabled ? '#1e293b' : '#334155',
          color: disabled ? '#64748b' : 'white',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />

      <select
        name="category"
        value={transaction.category}
        onChange={(e) => onChange(index, e)}
        required
        disabled={disabled}
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.category ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: disabled ? '#1e293b' : '#334155',
          color: disabled ? '#64748b' : 'white',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'pointer'
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
        disabled={disabled}
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.description ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: disabled ? '#1e293b' : '#334155',
          color: disabled ? '#64748b' : 'white',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
      />

      <input
        type="number"
        name="amount"
        placeholder="Amount"
        value={transaction.amount}
        onChange={(e) => onChange(index, e)}
        required
        disabled={disabled}
        style={{
          padding: '8px 12px',
          border: `1px solid ${error?.amount ? '#e74c3c' : '#475569'}`,
          borderRadius: '4px',
          backgroundColor: disabled ? '#1e293b' : '#334155',
          color: disabled ? '#64748b' : 'white',
          fontSize: '14px',
          cursor: disabled ? 'not-allowed' : 'text'
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
          disabled={disabled}
          style={{ 
            marginRight: '4px',
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
        />
        Recurring
      </label>

      {showRemove && (
        <button
          type="button"
          onClick={() => onRemove(index)}
          disabled={disabled}
          style={{
            padding: '6px',
            border: `1px solid ${disabled ? '#64748b' : '#e74c3c'}`,
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: disabled ? '#64748b' : '#e74c3c',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => {
            if (!disabled) {
              e.target.style.backgroundColor = '#e74c3c';
              e.target.style.color = 'white';
            }
          }}
          onMouseOut={(e) => {
            if (!disabled) {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = '#e74c3c';
            }
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
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTransactionsParsed = (parsedTransactions) => {
    // Convert parsed transactions to form format with category mapping
    const formattedTransactions = parsedTransactions.map(transaction => {
      // Map backend categories to frontend category values
      let mappedCategory = '';
      if (transaction.category) {
        const backendCategory = transaction.category.toLowerCase();
        // Map common category variations
        const categoryMapping = {
          'food': 'food',
          'dining': 'food', 
          'restaurant': 'food',
          'groceries': 'food',
          'grocery': 'food',
          'transportation': 'transport',
          'transport': 'transport',
          'gas': 'transport',
          'fuel': 'transport',
          'utilities': 'utilities',
          'utility': 'utilities',
          'electric': 'utilities',
          'water': 'utilities',
          'internet': 'utilities',
          'entertainment': 'entertainment',
          'streaming': 'entertainment',
          'movies': 'entertainment',
          'healthcare': 'health',
          'health': 'health',
          'medical': 'health',
          'pharmacy': 'health',
          'income': 'income',
          'salary': 'income',
          'wage': 'income',
          'clothing': 'clothing',
          'clothes': 'clothing',
          'shopping': 'miscellaneous',
          'cash': 'miscellaneous',
          'atm': 'miscellaneous'
        };
        
        mappedCategory = categoryMapping[backendCategory] || 'miscellaneous';
      }
      
      return {
        date: transaction.date || '',
        category: mappedCategory,
        description: transaction.description || '',
        amount: transaction.amount || '',
        is_recurring: transaction.is_recurring || false
      };
    });

    // Replace current transactions with parsed ones
    setTransactions(formattedTransactions);
    setErrors([]);
    setSuccess(`Successfully parsed ${formattedTransactions.length} transaction(s) from receipt!`);
    
    // Clear success message after 3 seconds
    setTimeout(() => setSuccess(''), 3000);
  };

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

        {/* Receipt Uploader */}
        <ReceiptUploader
          onTransactionsParsed={handleTransactionsParsed}
          loading={receiptLoading}
          setLoading={setReceiptLoading}
        />

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
            disabled={receiptLoading}
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
            disabled={loading || receiptLoading}
          >
            + Add Another Transaction
          </Button>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={onCancel}
              variant="secondary"
              disabled={loading || receiptLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              disabled={loading || receiptLoading}
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
