import axios from "axios";
import { showPopup } from "./popupManager";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
});

// Interceptor odpowiedzi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    let message;

    // Nowa logika dla struktury błędów z Express Validator
    if (status === 400 && error.response?.data?.errors) {
      message = error.response.data.errors[0].msg;
    } else {
      message = error.response?.data?.message || "Wystąpił nieznany błąd";
    }

    const emotion = status >= 500 ? "warning" : "negative";

    showPopup({
      message: `${message} (${status || "ERR"})`,
      emotion,
      duration: 5000
    });

    return Promise.reject(error);
  }
);

export default api;
