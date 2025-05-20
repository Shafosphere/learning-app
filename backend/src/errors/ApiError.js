// src/errors/ApiError.js
export default class ApiError extends Error {
    constructor(statusCode, code, message, details = null) {
      super(message);
      this.statusCode = statusCode;
      this.code       = code;
      this.details    = details;   // dowolne dodatkowe info, np. array z express-validator
    }
  }
  