import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API Service functions
export const movieAPI = {
  // Health check
  healthCheck: async () => {
    const response = await api.get('/api/health');
    return response.data;
  },

  // Get popular movies
  getPopularMovies: async (limit = 20) => {
    const response = await api.get('/api/popular', {
      params: { n: limit }
    });
    return response.data;
  },

  // Search movies
  searchMovies: async (query, limit = 20) => {
    const response = await api.get('/api/movies/search', {
      params: { q: query, n: limit }
    });
    return response.data;
  },

  // Get similar movies
  getSimilarMovies: async (movieId, limit = 10) => {
    const response = await api.get(`/api/movies/${movieId}/similar`, {
      params: { n: limit }
    });
    return response.data;
  },

  // Get movie details
  getMovieDetails: async (movieId) => {
    const response = await api.get(`/api/movies/${movieId}`);
    return response.data;
  },

  // Get user recommendations
  getUserRecommendations: async (userId, limit = 10) => {
    const response = await api.get(`/api/recommendations/user/${userId}`, {
      params: { n: limit }
    });
    return response.data;
  },

  // Get all genres
  getGenres: async () => {
    const response = await api.get('/api/genres');
    return response.data;
  },

  // Get movies by genre
  getMoviesByGenre: async (genre, limit = 20) => {
    const response = await api.get('/api/movies/by-genre', {
      params: { genre, n: limit }
    });
    return response.data;
  },
};

// Error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response) {
      // Server responded with error
      throw new Error(error.response.data.error || 'Server error occurred');
    } else if (error.request) {
      // No response received
      throw new Error('No response from server. Please check if the backend is running.');
    } else {
      // Request setup error
      throw new Error('Request failed: ' + error.message);
    }
  }
);

export default api;