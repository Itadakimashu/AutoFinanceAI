import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { transactionsAPI } from './api';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
    is_recurring: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    } else {
      // If not authenticated, clear transactions and stop loading
      setTransactions([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching transactions...');
      const data = await transactionsAPI.getTransactions();
      console.log('Transactions data received:', data);
      
      // Handle different response formats
      if (data && data.results && Array.isArray(data.results)) {
        // Paginated response
        setTransactions(data.results);
      } else if (Array.isArray(data)) {
        // Direct array response
        setTransactions(data);
      } else {
        // Unexpected format
        console.warn('Unexpected data format:', data);
        setTransactions([]);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      console.error('Error details:', error.response?.data);
      setError(`Failed to load transactions: ${error.response?.data?.detail || error.message}`);
      setTransactions([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      const newTransaction = await transactionsAPI.createTransaction(formData);
      setTransactions(prev => [newTransaction, ...prev]);
      setFormData({ date: '', category: '', description: '', amount: '', is_recurring: false });
    } catch (error) {
      console.error('Failed to add transaction:', error);
      setError('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsAPI.deleteTransaction(transactionId);
        setTransactions(prev => prev.filter(tx => tx.id !== transactionId));
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        setError('Failed to delete transaction');
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingId(transaction.id);
    setEditFormData({
      date: transaction.date,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      is_recurring: transaction.is_recurring
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveEdit = async (transactionId) => {
    try {
      console.log('Saving transaction:', transactionId, editFormData);
      const updatedTransaction = await transactionsAPI.updateTransaction(transactionId, editFormData);
      setTransactions(prev => prev.map(tx => 
        tx.id === transactionId ? updatedTransaction : tx
      ));
      setEditingId(null);
      setEditFormData({});
      setError(''); // Clear any previous errors
    } catch (error) {
      console.error('Failed to update transaction:', error);
      console.error('Error response:', error.response?.data);
      let errorMessage = 'Failed to update transaction';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = Object.values(error.response.data).flat().join(', ');
        } else {
          errorMessage = error.response.data;
        }
      }
      setError(errorMessage);
    }
  };

  return (
    <section className="transactions-wrapper" id="transactions">
      <div className="transactions-card">
        <h2>Transactions</h2>

        {error && (
          <div className="error-message" style={{ 
            color: '#e74c3c', 
            backgroundColor: '#fdf2f2', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px',
            border: '1px solid #e74c3c'
          }}>
            {error}
          </div>
        )}

        <form className="add-transaction-form" onSubmit={handleAddTransaction}>
          <input 
            type="date" 
            name="date" 
            value={formData.date} 
            onChange={handleChange} 
            required 
          />
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            required
          >
            <option value="">Select Category</option>
            <option value="income">Income</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="utilities">Utilities</option>
            <option value="entertainment">Entertainment</option>
            <option value="health">Health</option>
            <option value="education">Education</option>
            <option value="clothing">Clothing</option>
            <option value="housing">Housing</option>
            <option value="savings">Savings</option>
            <option value="investment">Investment</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
          <input 
            type="text" 
            name="description" 
            placeholder="Description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
          />
          <input 
            type="number" 
            name="amount" 
            placeholder="Amount (BDT)" 
            value={formData.amount} 
            onChange={handleChange} 
            required 
          />
          <label>
            <input
              type="checkbox"
              name="is_recurring"
              checked={formData.is_recurring}
              onChange={handleChange}
            />
            Recurring Transaction
          </label>
          <button type="submit" className="add-btn">+ Add Transaction</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount (BDT)</th>
              <th>Recurring</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading transactions...
                </td>
              </tr>
            ) : (Array.isArray(transactions) && transactions.length === 0) ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No transactions found. Add your first transaction above!
                </td>
              </tr>
            ) : (
              (Array.isArray(transactions) ? transactions : []).map((tx, index) => (
                <tr key={tx.id || index}>
                  {editingId === tx.id ? (
                    // Edit mode
                    <>
                      <td>
                        <input
                          type="date"
                          name="date"
                          value={editFormData.date}
                          onChange={handleEditFormChange}
                          style={{ width: '100%', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <select
                          name="category"
                          value={editFormData.category}
                          onChange={handleEditFormChange}
                          style={{ width: '100%', padding: '4px' }}
                        >
                          <option value="income">Income</option>
                          <option value="food">Food</option>
                          <option value="transport">Transport</option>
                          <option value="utilities">Utilities</option>
                          <option value="entertainment">Entertainment</option>
                          <option value="health">Health</option>
                          <option value="education">Education</option>
                          <option value="clothing">Clothing</option>
                          <option value="housing">Housing</option>
                          <option value="savings">Savings</option>
                          <option value="investment">Investment</option>
                          <option value="miscellaneous">Miscellaneous</option>
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          name="description"
                          value={editFormData.description}
                          onChange={handleEditFormChange}
                          style={{ width: '100%', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          name="amount"
                          value={editFormData.amount}
                          onChange={handleEditFormChange}
                          style={{ width: '100%', padding: '4px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          name="is_recurring"
                          checked={editFormData.is_recurring}
                          onChange={handleEditFormChange}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => handleSaveEdit(tx.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#27ae60',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            marginRight: '4px'
                          }}
                          title="Save changes"
                        >
                          ✓
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#95a5a6',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px 8px',
                            borderRadius: '4px'
                          }}
                          title="Cancel edit"
                        >
                          ✕
                        </button>
                      </td>
                    </>
                  ) : (
                    // View mode
                    <>
                      <td>{tx.date}</td>
                      <td style={{ textTransform: 'capitalize' }}>{tx.category}</td>
                      <td>{tx.description}</td>
                      <td>{tx.amount}</td>
                      <td>{tx.is_recurring ? 'Yes' : 'No'}</td>
                      <td>
                        <button
                          onClick={() => handleEditTransaction(tx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#3498db',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            marginRight: '4px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#e3f2fd'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Edit transaction"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#e74c3c',
                            cursor: 'pointer',
                            fontSize: '16px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#fdf2f2'}
                          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Delete transaction"
                        >
                          🗑️
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Transactions;
