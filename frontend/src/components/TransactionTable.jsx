import React from 'react';

const TransactionTable = ({ 
  transactions, 
  loading, 
  sortBy, 
  sortOrder, 
  handleSortChange,
  onTransactionClick 
}) => {
  return (
    <table>
      <thead>
        <tr>
          <th 
            onClick={() => handleSortChange('date')}
            style={{ 
              cursor: 'pointer', 
              userSelect: 'none'
            }}
            title="Click to sort by date"
          >
            Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </th>
          <th>Category</th>
          <th>Description</th>
          <th 
            onClick={() => handleSortChange('amount')}
            style={{ 
              cursor: 'pointer', 
              userSelect: 'none'
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
            <tr 
              key={tx.id || index}
              onClick={() => onTransactionClick && onTransactionClick(tx)}
              style={{
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <td>{tx.date}</td>
              <td style={{ textTransform: 'capitalize' }}>{tx.category}</td>
              <td>
                <div 
                  style={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    display: 'block'
                  }}
                  title={tx.description}
                >
                  {tx.description}
                </div>
              </td>
              <td style={{ fontWeight: '600' }}>{tx.amount}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default TransactionTable;
