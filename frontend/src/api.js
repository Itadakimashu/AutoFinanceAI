import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://autofinanceai.onrender.com/', // Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `JWT ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post('https://autofinanceai.onrender.com/auth/jwt/refresh/', {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `JWT ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.hash = '#login';
      }
    }

    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Login user
  login: async (username, password) => {
    const response = await api.post('/auth/jwt/create/', {
      username,
      password,
    });
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/users/', userData);
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/users/me/');
    return response.data;
  },

  // Logout (just clear tokens)
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// Transactions API functions
export const transactionsAPI = {
  // Get all transactions
  getTransactions: async (params = {}) => {
    const response = await api.get('/api/transactions/', { params });
    return response.data;
  },

  // Create transaction
  createTransaction: async (transactionData) => {
    const response = await api.post('/api/transactions/', transactionData);
    return response.data;
  },

  // Update transaction
  updateTransaction: async (id, transactionData) => {
    const response = await api.patch(`/api/transactions/${id}/`, transactionData);
    return response.data;
  },

  // Delete transaction
  deleteTransaction: async (id) => {
    const response = await api.delete(`/api/transactions/${id}/`);
    return response.data;
  },

  // Parse transactions from image
  parseTransactionsFromImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/api/image-to-trasaction/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download transactions PDF
  downloadTransactionsPDF: async (year, month) => {
    const response = await api.get('/api/transactions/pdf/download/', {
      params: { year, month },
      responseType: 'blob', // Important for file downloads
    });
    return response;
  },
};

export default api;
