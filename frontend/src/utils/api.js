import axios from 'axios';

// Konfiguracja Axios
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Umożliwia wysyłanie ciasteczek
});

// Middleware dla Axios
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

export default api;
