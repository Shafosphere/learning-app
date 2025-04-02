import axios from "axios";
import { showPopup } from "./popupManager";
import { translate } from "./intlManager";

function isErrorCode(msg) {
  return msg?.startsWith("ERR_");
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const errorCode = error.response?.data?.code; // Poprawione: używamy errorCode zamiast code

    // Specjalna obsługa błędów autentykacji
    if (errorCode === "ERR_TOKEN_NOT_FOUND") {
      return Promise.reject(error);
    }

    // Ekstrakcja wiadomości
    let rawMsg,
      params = {};
    if (status === 400 && error.response?.data?.errors) {
      const firstError = error.response.data.errors[0];
      rawMsg = firstError.msg;
      params = firstError.params || {};
    } else {
      rawMsg = error.response?.data?.message || "ERR_UNKNOWN_ERROR";
    }

    // Tłumaczenie komunikatów
    let finalMsg;
    if (isErrorCode(rawMsg)) {
      finalMsg = translate(rawMsg, "An unknown error occurred", params);
    } else {
      finalMsg = rawMsg;
    }

    // Wyświetlanie popupu
    showPopup({
      message: finalMsg,
      emotion: status >= 500 ? "warning" : "negative",
      duration: 5000,
    });

    return Promise.reject(error);
  }
);

export default api;
