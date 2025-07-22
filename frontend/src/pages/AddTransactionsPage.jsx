import React from 'react';
import { useAuth } from '../AuthContext';
import { transactionsAPI } from '../api';
import MultiTransactionForm from '../components/MultiTransactionForm';
import { navigateTo } from '../utils/helpers';

const AddTransactionsPage = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigateTo('#login');
    return null;
  }

  const handleSave = async (transactions) => {
    // Save all transactions one by one
    const promises = transactions.map(transaction => 
      transactionsAPI.createTransaction(transaction)
    );
    
    await Promise.all(promises);
    
    // Redirect to transactions page after successful save
    setTimeout(() => {
      navigateTo('#transactions');
    }, 1500);
  };

  const handleCancel = () => {
    navigateTo('#transactions');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      paddingTop: '80px', // Account for navbar
      paddingBottom: '40px'
    }}>
      <MultiTransactionForm 
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AddTransactionsPage;
