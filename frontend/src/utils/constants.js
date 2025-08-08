// Common constants used across the application

export const ROUTES = {
  HOME: '#home',
  LOGIN: '#login',
  SIGNUP: '#signup',
  TRANSACTIONS: '#transactions',
  ADD_TRANSACTIONS: '#add-transactions',
  ANALYSIS: '#analysis'
};

export const CATEGORIES = [
  { value: 'income', label: 'Income' },
  { value: 'food', label: 'Food' },
  { value: 'transport', label: 'Transport' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'housing', label: 'Housing' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
  { value: 'tax', label: 'Tax' }
];

export const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'amount', label: 'Amount' },
  { value: 'category', label: 'Category' },
  { value: 'description', label: 'Description' }
];

export const PAGE_SIZES = [5, 10, 20, 50];

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login/',
  REGISTER: '/api/auth/register/',
  REFRESH: '/api/auth/refresh/',
  TRANSACTIONS: '/api/transactions/',
  ANALYSIS: '/api/analysis/'
};

export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  SIGNUP_SUCCESS: 'Account created successfully! Redirecting to login...',
  TRANSACTION_ADDED: 'Transaction added successfully!',
  TRANSACTION_UPDATED: 'Transaction updated successfully!',
  TRANSACTION_DELETED: 'Transaction deleted successfully!',
  ERROR_GENERIC: 'An unexpected error occurred. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_UNAUTHORIZED: 'Please login to continue.',
  LOADING_TRANSACTIONS: 'Loading transactions...',
  NO_TRANSACTIONS: 'No transactions found. Add your first transaction above!'
};
