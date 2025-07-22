import React from 'react';
import ErrorMessage from './common/ErrorMessage';
import Button from './common/Button';
import { CATEGORIES } from '../utils/constants';

const TransactionForm = ({ formData, handleChange, handleAddTransaction, error }) => {
  return (
    <>
      <ErrorMessage message={error} />

      <form className="add-transaction-form" onSubmit={handleAddTransaction}>
        <input 
          type="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange} 
          required 
        />
        <select 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          required
        >
          <option value="">Select Category</option>
          {CATEGORIES.map(category => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </select>
        <input 
          type="text" 
          name="description" 
          placeholder="Description" 
          value={formData.description} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="number" 
          name="amount" 
          placeholder="Amount (BDT)" 
          value={formData.amount} 
          onChange={handleChange} 
          required 
        />
        <label>
          <input
            type="checkbox"
            name="is_recurring"
            checked={formData.is_recurring}
            onChange={handleChange}
          />
          Recurring Transaction
        </label>
        <Button type="submit" style={{ width: '100%' }}>
          + Add Transaction
        </Button>
      </form>
    </>
  );
};

export default TransactionForm;
