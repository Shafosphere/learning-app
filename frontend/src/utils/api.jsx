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
    const errorCode = error.response?.data?.code; // Fixed: using errorCode instead of code

    // Special handling for authentication errors
    if (errorCode === "ERR_TOKEN_NOT_FOUND") {
      return Promise.reject(error);
    }

    // Extracting the error message
    let rawMsg;
    let params = {};
    if (status === 400 && error.response?.data?.errors) {
      const firstError = error.response.data.errors[0];
      rawMsg = firstError.msg;
      params = firstError.params || {};
    } else {
      rawMsg = error.response?.data?.message || "ERR_UNKNOWN_ERROR";
    }

    // Translating messages
    let finalMsg;
    if (isErrorCode(rawMsg)) {
      finalMsg = translate(rawMsg, "An unknown error occurred", params);
    } else {
      finalMsg = rawMsg;
    }

    // Displaying popup
    showPopup({
      message: finalMsg,
      emotion: status >= 500 ? "warning" : "negative",
      duration: 5000,
    });

    return Promise.reject(error);
  }
);

export default api;
