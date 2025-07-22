import React from 'react';

const TransactionTable = ({ 
  transactions, 
  loading, 
  sortBy, 
  sortOrder, 
  handleSortChange 
}) => {
  return (
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
  );
};

export default TransactionTable;
