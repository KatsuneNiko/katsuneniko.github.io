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
  
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data.valid;
    } catch (error) {
      return false;
    }
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
  
  getCard: async (id) => {
    const response = await api.get(`/cards/${id}`);
    return response.data;
  },
  
  addCard: async (cardData) => {
    const response = await api.post('/cards', cardData);
    return response.data;
  },
  
  updateCard: async (id, quantity) => {
    const response = await api.patch(`/cards/${id}`, { quantity });
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
  }
};

// GitHub services
export const githubService = {
  getProfile: async () => {
    const response = await api.get('/github/profile');
    return response.data;
  },
  
  refreshCache: async () => {
    const response = await api.post('/github/refresh');
    return response.data;
  }
};

export default api;
