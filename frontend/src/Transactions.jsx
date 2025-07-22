import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { transactionsAPI } from './api';
import { useTransactions } from './hooks/useTransactions';
import {
  TransactionForm,
  SearchBar,
  FiltersSidebar,
  FilterSummary,
  PaginationInfo,
  TransactionTable,
  PaginationControls
} from './components';
import TransactionDetailModal from './components/TransactionDetailModal';
import './Transactions.css';

const Transactions = () => {
  const { isAuthenticated } = useAuth();
  const {
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
  } = useTransactions(isAuthenticated);

  const [formData, setFormData] = useState({
    date: '',
    category: '',
    description: '',
    amount: '',
    is_recurring: false,
  });

  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      await transactionsAPI.createTransaction(formData);
      setCurrentPage(1);
      setFormData({ date: '', category: '', description: '', amount: '', is_recurring: false });
      fetchTransactions();
    } catch (error) {
      setError('Failed to add transaction');
    }
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleTransactionUpdate = () => {
    fetchTransactions(); // Refresh the transactions list
  };

  const handleTransactionDelete = () => {
    fetchTransactions(); // Refresh the transactions list
  };

  return (
    <section className="transactions-wrapper" id="transactions">
      <div className="transactions-card">
        <h2>Transactions</h2>

        <TransactionForm 
          formData={formData}
          handleChange={handleChange}
          handleAddTransaction={handleAddTransaction}
          error={error}
        />

        <SearchBar 
          searchInput={searchInput}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
        />

        <div style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'flex-start'
        }}>
          <FiltersSidebar 
            categoryFilter={categoryFilter}
            handleCategoryFilterChange={handleCategoryFilterChange}
            dateFrom={dateFrom}
            dateTo={dateTo}
            setDateFrom={setDateFrom}
            setDateTo={setDateTo}
            amountMin={amountMin}
            amountMax={amountMax}
            setAmountMin={setAmountMin}
            setAmountMax={setAmountMax}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSortChange={handleSortChange}
            clearFilters={clearFilters}
            setCurrentPage={setCurrentPage}
          />

          <div style={{ flex: 1 }}>
            <FilterSummary 
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              dateFrom={dateFrom}
              dateTo={dateTo}
              amountMin={amountMin}
              amountMax={amountMax}
              sortBy={sortBy}
              sortOrder={sortOrder}
            />

            <PaginationInfo 
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              totalPages={totalPages}
            />

            <TransactionTable 
              transactions={transactions}
              loading={loading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              handleSortChange={handleSortChange}
              onTransactionClick={handleTransactionClick}
            />

            <PaginationControls 
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        transaction={selectedTransaction}
        onUpdate={handleTransactionUpdate}
        onDelete={handleTransactionDelete}
      />
    </section>
  );
};

export default Transactions;
