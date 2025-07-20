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
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize] = useState(10); // Fixed page size
  
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
  }, [isAuthenticated, searchTerm, categoryFilter, sortBy, sortOrder, currentPage]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Fetching transactions...');
      
      // Build query parameters
      const params = {
        page: currentPage,
        page_size: pageSize
      };
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (sortBy) {
        params.ordering = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
      }
      
      const data = await transactionsAPI.getTransactions(params);
      console.log('Transactions data received:', data);
      
      // Handle different response formats
      if (data && data.results && Array.isArray(data.results)) {
        // Paginated response
        setTransactions(data.results);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / pageSize));
      } else if (Array.isArray(data)) {
        // Direct array response (fallback)
        setTransactions(data);
        setTotalCount(data.length);
        setTotalPages(1);
      } else {
        // Unexpected format
        console.warn('Unexpected data format:', data);
        setTransactions([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      console.error('Error details:', error.response?.data);
      setError(`Failed to load transactions: ${error.response?.data?.detail || error.message}`);
      setTransactions([]); // Set empty array on error
      setTotalCount(0);
      setTotalPages(1);
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
      // After adding, go to first page and refresh
      setCurrentPage(1);
      setFormData({ date: '', category: '', description: '', amount: '', is_recurring: false });
      // Refresh transactions to get updated data
      fetchTransactions();
    } catch (error) {
      console.error('Failed to add transaction:', error);
      setError('Failed to add transaction');
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionsAPI.deleteTransaction(transactionId);
        // Refresh transactions to get updated data
        fetchTransactions();
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
      // Refresh to get updated data
      fetchTransactions();
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

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default descending order
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
    setSortBy('date');
    setSortOrder('desc');
    setCurrentPage(1); // Reset to first page when clearing filters
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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

        {/* Search and Filter Controls */}
        <div className="filters-section" style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a254a',
          borderRadius: '8px',
          flexWrap: 'wrap',
          alignItems: 'center',
          border: '1px solid #475569'
        }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #475569',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#334155',
                color: 'white'
              }}
            />
          </div>
          
          <div style={{ minWidth: '150px' }}>
            <select
              value={categoryFilter}
              onChange={handleCategoryFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #475569',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: '#334155',
                color: 'white'
              }}
            >
              <option value="">All Categories</option>
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
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#d8b4fe' }}>Sort by:</span>
            <button
              onClick={() => handleSortChange('date')}
              style={{
                padding: '6px 12px',
                border: sortBy === 'date' ? '2px solid #a78bfa' : '1px solid #475569',
                borderRadius: '4px',
                backgroundColor: sortBy === 'date' ? '#322e50' : '#334155',
                color: sortBy === 'date' ? '#d8b4fe' : 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSortChange('amount')}
              style={{
                padding: '6px 12px',
                border: sortBy === 'amount' ? '2px solid #a78bfa' : '1px solid #475569',
                borderRadius: '4px',
                backgroundColor: sortBy === 'amount' ? '#322e50' : '#334155',
                color: sortBy === 'amount' ? '#d8b4fe' : 'white',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          </div>

          <button
            onClick={clearFilters}
            style={{
              padding: '8px 16px',
              border: '1px solid #a78bfa',
              borderRadius: '4px',
              backgroundColor: '#322e50',
              color: '#d8b4fe',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#a78bfa';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#322e50';
              e.target.style.color = '#d8b4fe';
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Filter Summary */}
        {(searchTerm || categoryFilter || sortBy !== 'date' || sortOrder !== 'desc') && (
          <div style={{
            padding: '10px',
            backgroundColor: '#322e50',
            borderRadius: '4px',
            marginBottom: '15px',
            fontSize: '14px',
            color: '#d8b4fe',
            border: '1px solid #475569'
          }}>
            <strong>Active filters:</strong>
            {searchTerm && <span> Search: "{searchTerm}"</span>}
            {categoryFilter && <span> Category: {categoryFilter}</span>}
            <span> Sorted by: {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})</span>
          </div>
        )}

        {/* Pagination Info - Always show when there are transactions */}
        {totalCount > 0 && (
          <div style={{
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#2a254a',
            borderRadius: '8px',
            border: '1px solid #475569',
            textAlign: 'center',
            color: '#d8b4fe',
            fontSize: '14px'
          }}>
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </div>
        )}

        <table style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead>
            <tr>
              <th 
                onClick={() => handleSortChange('date')}
                style={{ 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  width: '12%'
                }}
                title="Click to sort by date"
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ width: '12%' }}>Category</th>
              <th style={{ width: '40%' }}>Description</th>
              <th 
                onClick={() => handleSortChange('amount')}
                style={{ 
                  cursor: 'pointer', 
                  userSelect: 'none',
                  width: '15%'
                }}
                title="Click to sort by amount"
              >
                Amount (BDT) {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th style={{ width: '10%' }}>Recurring</th>
              <th style={{ width: '11%' }}>Actions</th>
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
                          style={{ 
                            width: '100%', 
                            padding: '4px',
                            maxWidth: '100%',
                            boxSizing: 'border-box'
                          }}
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
                      <td 
                        style={{ 
                          maxWidth: '0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={tx.description}
                      >
                        {tx.description}
                      </td>
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#2a254a',
            borderRadius: '8px',
            border: '1px solid #475569'
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  backgroundColor: currentPage === 1 ? '#1e293b' : '#334155',
                  color: currentPage === 1 ? '#64748b' : '#d8b4fe',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                First
              </button>
              
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  backgroundColor: currentPage === 1 ? '#1e293b' : '#334155',
                  color: currentPage === 1 ? '#64748b' : '#d8b4fe',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    style={{
                      padding: '6px 12px',
                      border: currentPage === pageNum ? '2px solid #a78bfa' : '1px solid #475569',
                      borderRadius: '4px',
                      backgroundColor: currentPage === pageNum ? '#322e50' : '#334155',
                      color: currentPage === pageNum ? '#d8b4fe' : 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  backgroundColor: currentPage === totalPages ? '#1e293b' : '#334155',
                  color: currentPage === totalPages ? '#64748b' : '#d8b4fe',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Next
              </button>
              
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #475569',
                  borderRadius: '4px',
                  backgroundColor: currentPage === totalPages ? '#1e293b' : '#334155',
                  color: currentPage === totalPages ? '#64748b' : '#d8b4fe',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '12px'
                }}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Transactions;
