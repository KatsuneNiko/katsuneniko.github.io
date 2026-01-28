import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Card services
export const cardService = {
  getAllCards: async (search = '') => {
    const response = await api.get(`/cards${search ? `?search=${search}` : ''}`);
    return response.data;
  },
  addCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },
  incrementCard: async (id) => {
    const response = await api.post(`/cards/${id}/increment`);
    return response.data;
  },
  
  decrementCard: async (id) => {
    const response = await api.post(`/cards/${id}/decrement`);
    return response.data;
  },
  
  deleteCard: async (id) => {
    const response = await api.delete(`/cards/${id}`);
    return response.data;
  },
  
  searchYGOPro: async (name) => {
    const response = await api.get(`/cards/search/ygopro?name=${name}`);
    return response.data;
  },
  
  getExchangeRate: async () => {
    const response = await api.get('/cards/exchange-rate/usd-aud');
    return response.data;
  }
};

// GitHub services
export const githubService = {
  getProfile: async () => {
    const response = await api.get('/github/profile');
    return response.data;
  },
  
  checkForChanges: async () => {
    const response = await api.get('/github/changes');
    return response.data;
  },
  
  refreshProfile: async () => {
    const response = await api.post('/github/refresh');
    return response.data;
  }
};

export default api;
