import React, { useState, useRef } from 'react';
import Button from './common/Button';
import ErrorMessage from './common/ErrorMessage';

const ReceiptUploader = ({ onTransactionsParsed, loading, setLoading }) => {
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { transactionsAPI } = await import('../api');
      const response = await transactionsAPI.parseTransactionsFromImage(file);
      
      if (response.success && response.transactions) {
        onTransactionsParsed(response.transactions);
      } else {
        setError(response.error || 'Failed to parse transactions from image');
      }
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setError('Failed to process receipt. Please try again.');
    } finally {
      setLoading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        style={{ display: 'none' }}
        disabled={loading}
      />
      
      <Button
        onClick={triggerFileInput}
        variant="primary"
        disabled={loading}
        style={{
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        📄 Add Receipt
      </Button>
      
      {error && <ErrorMessage message={error} />}
      
      <p style={{
        color: '#94a3b8',
        fontSize: '12px',
        marginTop: '8px',
        marginBottom: '0'
      }}>
        Upload a receipt image to automatically extract transactions
      </p>
    </div>
  );
};

export default ReceiptUploader;
