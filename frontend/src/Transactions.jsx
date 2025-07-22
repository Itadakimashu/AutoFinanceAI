import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { transactionsAPI } from './api';
import './Transactions.css';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // New state for input field
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Date range filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Amount range filters
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  
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
  }, [isAuthenticated, searchTerm, categoryFilter, sortBy, sortOrder, currentPage, dateFrom, dateTo, amountMin, amountMax]);

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
      
      // Add date range filters
      if (dateFrom) params.date_after = dateFrom;
      if (dateTo) params.date_before = dateTo;
      
      // Add amount range filters
      if (amountMin) params.amount__gte = amountMin;
      if (amountMax) params.amount__lte = amountMax;
      
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



  const handleSearchChange = (e) => {
    setSearchInput(e.target.value); // Update input field without triggering search
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput); // Trigger search only on Enter
      setCurrentPage(1); // Reset to first page when searching
    }
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
    setSearchInput(''); // Also clear the input field
    setCategoryFilter('');
    setSortBy('date');
    setSortOrder('desc');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
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

        {/* Search Bar at Top */}
        <div style={{
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#2a254a',
          borderRadius: '8px',
          border: '1px solid #475569'
        }}>
          <input
            type="text"
            placeholder="Search transactions by description... (Press Enter to search)"
            value={searchInput}
            onChange={handleSearchChange}
            onKeyDown={handleSearchSubmit}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #475569',
              borderRadius: '6px',
              fontSize: '16px',
              backgroundColor: '#334155',
              color: 'white',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = '#a78bfa'}
            onBlur={(e) => e.target.style.borderColor = '#475569'}
          />
        </div>

        {/* Main Content Layout: Filters Sidebar + Transactions */}
        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start'
        }}>
          {/* Filters Sidebar */}
          <div style={{
            width: '280px',
            flexShrink: 0,
            backgroundColor: '#2a254a',
            borderRadius: '12px',
            border: '1px solid #475569',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                color: '#d8b4fe',
                fontWeight: '600'
              }}>
                🔍 Filters
              </h3>
              <button
                onClick={clearFilters}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #a78bfa',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: '#a78bfa',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#a78bfa';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#a78bfa';
                }}
              >
                Reset
              </button>
            </div>

            {/* Category Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#d8b4fe',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#334155',
                  color: 'white',
                  cursor: 'pointer'
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

            {/* Date Range Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#d8b4fe',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Date Range
              </label>
              <div style={{ marginBottom: '10px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  From
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: 'white'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  To
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: 'white'
                  }}
                />
              </div>
            </div>

            {/* Amount Range Filter */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#d8b4fe',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Amount Range (BDT)
              </label>
              <div style={{ marginBottom: '10px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  Minimum
                </label>
                <input
                  type="number"
                  value={amountMin}
                  onChange={(e) => {
                    setAmountMin(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: 'white'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginBottom: '4px'
                }}>
                  Maximum
                </label>
                <input
                  type="number"
                  value={amountMax}
                  onChange={(e) => {
                    setAmountMax(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="No limit"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#334155',
                    color: 'white'
                  }}
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#d8b4fe',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                Sort by
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleSortChange('date')}
                  style={{
                    padding: '10px 12px',
                    border: sortBy === 'date' ? '2px solid #a78bfa' : '1px solid #475569',
                    borderRadius: '6px',
                    backgroundColor: sortBy === 'date' ? '#322e50' : '#334155',
                    color: sortBy === 'date' ? '#d8b4fe' : 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (sortBy !== 'date') {
                      e.target.style.backgroundColor = '#475569';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (sortBy !== 'date') {
                      e.target.style.backgroundColor = '#334155';
                    }
                  }}
                >
                  📅 Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSortChange('amount')}
                  style={{
                    padding: '10px 12px',
                    border: sortBy === 'amount' ? '2px solid #a78bfa' : '1px solid #475569',
                    borderRadius: '6px',
                    backgroundColor: sortBy === 'amount' ? '#322e50' : '#334155',
                    color: sortBy === 'amount' ? '#d8b4fe' : 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    width: '100%'
                  }}
                  onMouseOver={(e) => {
                    if (sortBy !== 'amount') {
                      e.target.style.backgroundColor = '#475569';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (sortBy !== 'amount') {
                      e.target.style.backgroundColor = '#334155';
                    }
                  }}
                >
                  💰 Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
          </div>

          {/* Transactions Content */}
          <div style={{ flex: 1 }}>
            {/* Filter Summary */}
            {(searchTerm || categoryFilter || dateFrom || dateTo || amountMin || amountMax || sortBy !== 'date' || sortOrder !== 'desc') && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#322e50',
                borderRadius: '6px',
                marginBottom: '15px',
                fontSize: '14px',
                color: '#d8b4fe',
                border: '1px solid #475569'
              }}>
                <strong>Active filters:</strong>
                {searchTerm && <span> Search: "{searchTerm}"</span>}
                {categoryFilter && <span> Category: {categoryFilter}</span>}
                {(dateFrom || dateTo) && (
                  <span> Date: {dateFrom || '...'} to {dateTo || '...'}</span>
                )}
                {(amountMin || amountMax) && (
                  <span> Amount: {amountMin || '0'} to {amountMax || '∞'} BDT</span>
                )}
                <span> Sorted by: {sortBy} ({sortOrder === 'asc' ? 'ascending' : 'descending'})</span>
              </div>
            )}

            {/* Pagination Info */}
            {totalCount > 0 && (
              <div style={{
                marginBottom: '15px',
                padding: '12px 16px',
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
                      width: '15%'
                    }}
                    title="Click to sort by date"
                  >
                    Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{ width: '18%' }}>Category</th>
                  <th style={{ width: '47%' }}>Description</th>
                  <th 
                    onClick={() => handleSortChange('amount')}
                    style={{ 
                      cursor: 'pointer', 
                      userSelect: 'none',
                      width: '20%'
                    }}
                    title="Click to sort by amount"
                  >
                    Amount (BDT) {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  Loading transactions...
                </td>
              </tr>
            ) : (Array.isArray(transactions) && transactions.length === 0) ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No transactions found. Add your first transaction above!
                </td>
              </tr>
            ) : (
              (Array.isArray(transactions) ? transactions : []).map((tx, index) => (
                <tr key={tx.id || index}>
                  <td>{tx.date}</td>
                  <td style={{ textTransform: 'capitalize' }}>{tx.category}</td>
                  <td>
                    <span 
                      style={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={tx.description}
                    >
                      {tx.description} {tx.is_recurring && '(Recurring)'}
                    </span>
                  </td>
                  <td style={{ fontWeight: '600' }}>{tx.amount}</td>
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
        </div>
      </div>
    </section>
  );
};

export default Transactions;
