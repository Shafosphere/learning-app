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

    // Wyciągnij wiadomość z backendu
    let rawMsg, params;
    if (status === 400 && error.response?.data?.errors) {
      const firstError = error.response.data.errors[0];
      rawMsg = firstError.msg;
      params = firstError.params || {}; // <-- Dodajemy params
    } else {
      rawMsg = error.response?.data?.message || "ERR_UNKNOWN_ERROR";
      params = {};
    }

    // Rozpoznanie i tłumaczenie:
    let finalMsg;
    if (isErrorCode(rawMsg)) {
      finalMsg = translate(rawMsg, "An unknown error occurred", params);
    } else {
      // To zwykły tekst, nie jest kodem = zostawiamy
      finalMsg = rawMsg;
    }

    showPopup({
      message: finalMsg, // <-- czysty string (przetłumaczony lub oryginał)
      emotion: status >= 500 ? "warning" : "negative",
      duration: 5000,
    });

    return Promise.reject(error);
  }
);

export default api;
