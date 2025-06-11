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
    console.log("Axios error.response:", error.response);
    const { status, data } = error.response ?? {};
    const { code, message, errors: list = [] } = data ?? {};

    if (code === "ERR_TOKEN_NOT_FOUND") return Promise.reject(error);

    let rawMsg = message || code || "ERR_UNKNOWN_ERROR"; // preferuj tekst, potem kod
    let params = {};

    if (status === 400 && list.length) {
      rawMsg = list[0].message || list[0].msg || rawMsg;
      params = list[0].params || {};
    }

    const finalMsg = isErrorCode(code)
      ? translate(code, rawMsg, params) // tłumaczymy po kluczu
      : rawMsg; // albo wyświetlamy surowy tekst

    showPopup({
      message: finalMsg,
      emotion: status >= 500 ? "warning" : "negative",
      duration: 5000,
    });

    return Promise.reject(error);
  }
);

export default api;