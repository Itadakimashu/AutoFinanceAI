import React from 'react';

const SearchBar = ({ searchInput, handleSearchChange, handleSearchSubmit }) => {
  return (
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
  );
};

export default SearchBar;
