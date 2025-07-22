import React from 'react';

const FilterSummary = ({ 
  searchTerm, 
  categoryFilter, 
  dateFrom, 
  dateTo, 
  amountMin, 
  amountMax, 
  sortBy, 
  sortOrder 
}) => {
  const hasActiveFilters = searchTerm || categoryFilter || dateFrom || dateTo || 
                          amountMin || amountMax || sortBy !== 'date' || sortOrder !== 'desc';

  if (!hasActiveFilters) {
    return null;
  }

  return (
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
  );
};

export default FilterSummary;
