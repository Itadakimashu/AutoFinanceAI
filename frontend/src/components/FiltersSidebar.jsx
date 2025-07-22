import React from 'react';
import { CATEGORIES } from '../utils/constants';

const FiltersSidebar = ({
  categoryFilter,
  handleCategoryFilterChange,
  dateFrom,
  dateTo,
  setDateFrom,
  setDateTo,
  amountMin,
  amountMax,
  setAmountMin,
  setAmountMax,
  sortBy,
  sortOrder,
  handleSortChange,
  clearFilters,
  setCurrentPage
}) => {
  return (
    <div style={{
      width: '280px',
      flexShrink: 0,
      backgroundColor: '#2a254a',
      borderRadius: '12px',
      border: '1px solid #475569',
      padding: '20px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          color: '#d8b4fe',
          fontWeight: '600'
        }}>
          🔍 Filters
        </h3>
        <button
          onClick={clearFilters}
          style={{
            padding: '6px 12px',
            border: '1px solid #a78bfa',
            borderRadius: '4px',
            backgroundColor: 'transparent',
            color: '#a78bfa',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#a78bfa';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#a78bfa';
          }}
        >
          Reset
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: '#d8b4fe',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          Category
        </label>
        <select
          value={categoryFilter}
          onChange={handleCategoryFilterChange}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #475569',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#334155',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
      </div>

      {/* Date Range Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: '#d8b4fe',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          Date Range
        </label>
        <div style={{ marginBottom: '10px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            From
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #475569',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#334155',
              color: 'white'
            }}
          />
        </div>
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            To
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #475569',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#334155',
              color: 'white'
            }}
          />
        </div>
      </div>

      {/* Amount Range Filter */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: '#d8b4fe',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          Amount Range (BDT)
        </label>
        <div style={{ marginBottom: '10px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            Minimum
          </label>
          <input
            type="number"
            value={amountMin}
            onChange={(e) => {
              setAmountMin(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="0"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #475569',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#334155',
              color: 'white'
            }}
          />
        </div>
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            color: '#94a3b8',
            marginBottom: '4px'
          }}>
            Maximum
          </label>
          <input
            type="number"
            value={amountMax}
            onChange={(e) => {
              setAmountMax(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="No limit"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #475569',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#334155',
              color: 'white'
            }}
          />
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '14px',
          color: '#d8b4fe',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          Sort by
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => handleSortChange('date')}
            style={{
              padding: '10px 12px',
              border: sortBy === 'date' ? '2px solid #a78bfa' : '1px solid #475569',
              borderRadius: '6px',
              backgroundColor: sortBy === 'date' ? '#322e50' : '#334155',
              color: sortBy === 'date' ? '#d8b4fe' : 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseOver={(e) => {
              if (sortBy !== 'date') {
                e.target.style.backgroundColor = '#475569';
              }
            }}
            onMouseOut={(e) => {
              if (sortBy !== 'date') {
                e.target.style.backgroundColor = '#334155';
              }
            }}
          >
            📅 Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => handleSortChange('amount')}
            style={{
              padding: '10px 12px',
              border: sortBy === 'amount' ? '2px solid #a78bfa' : '1px solid #475569',
              borderRadius: '6px',
              backgroundColor: sortBy === 'amount' ? '#322e50' : '#334155',
              color: sortBy === 'amount' ? '#d8b4fe' : 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textAlign: 'left',
              width: '100%'
            }}
            onMouseOver={(e) => {
              if (sortBy !== 'amount') {
                e.target.style.backgroundColor = '#475569';
              }
            }}
            onMouseOut={(e) => {
              if (sortBy !== 'amount') {
                e.target.style.backgroundColor = '#334155';
              }
            }}
          >
            💰 Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersSidebar;
