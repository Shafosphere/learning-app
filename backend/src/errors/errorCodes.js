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

  // --- Słowa / nauka -------------------------------------------
  INVALID_PATCH_NUMBER: {
    code: "ERR_INVALID_PATCH_NUMBER",
    status: 400,
    message: "Invalid patch number"
  },
  PATCH_NOT_FOUND: {
    code: "ERR_PATCH_NOT_FOUND",
    status: 404,
    message: "Patch not found"
  },
  MISSING_TRANSLATIONS: {
    code: "ERR_MISSING_TRANSLATIONS",
    status: 400,
    message: "Translations data is missing"
  },
  MISSING_ENGLISH: {
    code: "ERR_MISSING_ENGLISH",
    status: 400,
    message: "English translation is required"
  },
  INVALID_LEVEL: {
    code: "ERR_INVALID_LEVEL",
    status: 400,
    message: "Wrong level"
  },
  WORDS_MISSING: {
    code: "ERR_WORDS_MISSING",
    status: 404,
    message: "Words missing"
  },
  TRANSLATION_MISSING: {
    code: "ERR_TRANSLATION_MISSING",
    status: 404,
    message: "Translation is missing"
  },

  // --- Błędy użytkowników / progres --------------------------------
  NO_RECORDS: {
    code: "ERR_NO_RECORDS",
    status: 404,
    message: "No records found"
  },
  ALREADY_LEARNED: {
    code: "ERR_ALREADY_LEARNED",
    status: 400,
    message: "You have already learned this word."
  },
  NO_AUTOSAVE: {
    code: "ERR_NO_AUTOSAVE",
    status: 404,
    message: "No autosave data found"
  },
  ACCOUNT_BANNED: {
    code: "ERR_ACCOUNT_BANNED",
    status: 403,
    message: "Account banned"
  },

  // --- Raporty ---------------------------------------------------
  REPORT_NOT_FOUND: {
    code: "ERR_REPORT_NOT_FOUND",
    status: 404,
    message: "Report not found"
  },
  FETCH_TRANSLATIONS: {
    code: "ERR_FETCH_TRANSLATIONS",
    status: 500,
    message: "Error fetching translations"
  },
  INVALID_INPUT: {
    code: "ERR_INVALID_INPUT",
    status: 400,
    message: "Invalid input"
  },
  WORD_NOT_FOUND: {
    code: "ERR_WORD_NOT_FOUND",
    status: 404,
    message: "Word not found"
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
