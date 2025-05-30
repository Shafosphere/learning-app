// src/errors/throwErr.js
import ApiError from "./ApiError.js";
import { ERRORS } from "./errorCodes.js";

/** Rzuca ApiError na podstawie klucza z ERRORS */
export function throwErr(key, details) {
  const def = ERRORS[key];
  if (!def) {
    // Jeśli nie ma takiego klucza w ERRORS, rzucamy błąd z informacją
    throw new ApiError(500, "ERR_UNDEFINED", `Undefined error key: ${key}`);
  }
  throw new ApiError(def.status, def.code, def.message, details);
}
