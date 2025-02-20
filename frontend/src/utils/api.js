import axios from 'axios';

console.log("API URL:", process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;