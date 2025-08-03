import { useState, useEffect } from 'react';
import { transactionsAPI } from '../api';

export const useTransactions = (isAuthenticated) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(20); // Will be updated from backend response
  const [totals, setTotals] = useState({
    total_income: 0,
    total_expenses: 0,
    net_amount: 0
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        page_size: pageSize
      };
      
      if (searchTerm) params.search = searchTerm;
      if (categoryFilter) params.category = categoryFilter;
      if (sortBy) {
        params.ordering = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
      }
      if (dateFrom) params.date_after = dateFrom;
      if (dateTo) params.date_before = dateTo;
      if (amountMin) params.amount__gte = amountMin;
      if (amountMax) params.amount__lte = amountMax;
      
      const data = await transactionsAPI.getTransactions(params);
      
      if (data && data.results && Array.isArray(data.results)) {
        setTransactions(data.results);
        setTotalCount(data.count || 0);
        // Use backend's pagination data
        setTotalPages(data.total_pages || 1);
        setPageSize(data.page_size || 20);
        // Set totals if available in the response
        if (data.totals) {
          setTotals(data.totals);
        }
      } else if (Array.isArray(data)) {
        setTransactions(data);
        setTotalCount(data.length);
        setTotalPages(1);
        setPageSize(20);
      } else {
        setTransactions([]);
        setTotalCount(0);
        setTotalPages(1);
        setPageSize(20);
      }
    } catch (error) {
      setError(`Failed to load transactions: ${error.response?.data?.detail || error.message}`);
      setTransactions([]);
      setTotalCount(0);
      setTotalPages(1);
      setPageSize(20);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    } else {
      setTransactions([]);
      setLoading(false);
    }
  }, [isAuthenticated, searchTerm, categoryFilter, sortBy, sortOrder, currentPage, dateFrom, dateTo, amountMin, amountMax]);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }
  };

  const handleCategoryFilterChange = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setCategoryFilter('');
    setSortBy('date');
    setSortOrder('desc');
    setDateFrom('');
    setDateTo('');
    setAmountMin('');
    setAmountMax('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return {
    // State
    transactions,
    loading,
    error,
    setError,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    searchTerm,
    searchInput,
    categoryFilter,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
    amountMin,
    amountMax,
    totals,
    
    // Actions
    fetchTransactions,
    handleSearchChange,
    handleSearchSubmit,
    handleCategoryFilterChange,
    handleSortChange,
    clearFilters,
    handlePageChange,
    setCurrentPage,
    setDateFrom,
    setDateTo,
    setAmountMin,
    setAmountMax
  };
};
