import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { transactionsAPI } from './api';
import { useTransactions } from './hooks/useTransactions';
import {
  SearchBar,
  FiltersSidebar,
  FilterSummary,
  PaginationInfo,
  TransactionTable,
  PaginationControls,
  Button,
  TotalsSummary,
  DownloadModal
} from './components';
import TransactionDetailModal from './components/TransactionDetailModal';
import { navigateTo } from './utils/helpers';
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
    totals,
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

  // Modal state
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

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

  const handleDownloadClick = () => {
    setIsDownloadModalOpen(true);
  };

  const handleDownloadModalClose = () => {
    setIsDownloadModalOpen(false);
  };

  const handleDownload = async (formData) => {
    try {
      setDownloading(true);
      
      const response = await transactionsAPI.downloadTransactionsPDF(
        formData.year, 
        formData.month
      );
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Use custom filename with year and month
      const filename = `${formData.filename}_${formData.year}_${formData.month.toString().padStart(2, '0')}.pdf`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setIsDownloadModalOpen(false);
    } catch (error) {
      console.error('Download failed:', error);
      
      // Show error message to user
      if (error.response?.status === 404) {
        setError(`No transactions found for ${formData.year}-${formData.month.toString().padStart(2, '0')}`);
      } else {
        setError('Failed to download PDF. Please try again.');
      }
      
      // Clear error after a few seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="transactions-wrapper" id="transactions">
      <div className="transactions-card">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2>Transactions</h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button 
              onClick={handleDownloadClick}
              disabled={downloading}
              style={{
                background: downloading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white'
              }}
            >
              {downloading ? 'Downloading...' : '📄 Download PDF'}
            </Button>
            <Button onClick={() => navigateTo('#add-transactions')}>
              + Add Transactions
            </Button>
          </div>
        </div>

        <SearchBar 
          searchInput={searchInput}
          handleSearchChange={handleSearchChange}
          handleSearchSubmit={handleSearchSubmit}
        />

        {error && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠️</span>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#dc2626',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                width: '20px',
                height: '20px'
              }}
            >
              ×
            </button>
          </div>
        )}

        <TotalsSummary totals={totals} loading={loading} />

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

      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={handleDownloadModalClose}
        onDownload={handleDownload}
      />
    </section>
  );
};

export default Transactions;
