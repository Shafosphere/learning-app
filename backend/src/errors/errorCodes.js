// src/errors/errorCodes.js
export const ERRORS = {
  // --- Autoryzacja / uwierzytelnianie --------------------------
  INVALID_CREDENTIALS: {
    code: "ERR_INVALID_CREDENTIALS",
    status: 401,
    message: "Invalid credentials"
  },
  TOKEN_NOT_FOUND: {
    code: "ERR_TOKEN_NOT_FOUND",
    status: 401,
    message: "Token not found"
  },

  // --- Rejestracja ---------------------------------------------
  USER_EXISTS: {
    code: "ERR_USER_EXISTS",
    status: 409,
    message: "Username or email already exists"
  },
  REGISTRATION_FAIL: {
    code: "ERR_REGISTRATION",
    status: 500,
    message: "An error occurred during registration."
  },

  // --- Walidacja -----------------------------------------------
  VALIDATION: {
    code: "ERR_VALIDATION",
    status: 400,
    message: "Validation failed"
  },
  INVALID_OLD_PASSWORD: {
    code: "ERR_INVALID_OLD_PASSWORD",
    status: 400,
    message: "Old password is incorrect."
  },

  // --- Inne -----------------------------------------------------
  USER_NOT_FOUND: {
    code: "ERR_USER_NOT_FOUND",
    status: 404,
    message: "User not found"
  },
  SERVER: {
    code: "ERR_SERVER",
    status: 500,
    message: "Internal server error"
  }
};
