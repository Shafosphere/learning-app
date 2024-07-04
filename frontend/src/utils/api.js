import axios from 'axios';

// Konfiguracja Axios
const api = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // Umożliwia wysyłanie ciasteczek
});

// Middleware dla Axios (interceptory)
// Nie potrzebujemy dodawać tokena do nagłówków, ponieważ jest on wysyłany automatycznie jako ciasteczko httpOnly
api.interceptors.request.use(
  (config) => {
    // Można tutaj dodać inne modyfikacje konfiguracji zapytań, jeśli są potrzebne
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;