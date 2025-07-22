import React from 'react';

const PaginationInfo = ({ currentPage, pageSize, totalCount, totalPages }) => {
  if (totalCount === 0) {
    return null;
  }

  return (
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
  );
};

export default PaginationInfo;
