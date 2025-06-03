export const ERRORS = {
  INVALID_CREDENTIALS: {
    code: "ERR_INVALID_CREDENTIALS",
    status: 401,
    message: "Invalid credentials",
  },
  TOKEN_NOT_FOUND: {
    code: "ERR_TOKEN_NOT_FOUND",
    status: 401,
    message: "Token not found",
  },
  USER_EXISTS: {
    code: "ERR_USER_EXISTS",
    status: 409,
    message: "Username or email already exists",
  },
  REGISTRATION_FAIL: {
    code: "ERR_REGISTRATION",
    status: 500,
    message: "An error occurred during registration.",
  },
  VALIDATION: {
    code: "ERR_VALIDATION",
    status: 400,
    message: "Validation failed",
  },
  INVALID_OLD_PASSWORD: {
    code: "ERR_INVALID_OLD_PASSWORD",
    status: 400,
    message: "Old password is incorrect.",
  },
  INVALID_PATCH_NUMBER: {
    code: "ERR_INVALID_PATCH_NUMBER",
    status: 400,
    message:
      "Invalid patchNumber. It must be a positive integer between 1 and 999999.",
  },
  PATCH_NOT_FOUND: {
    code: "ERR_PATCH_NOT_FOUND",
    status: 404,
    message: "Patch not found",
  },
  MISSING_TRANSLATIONS: {
    code: "ERR_MISSING_TRANSLATIONS",
    status: 400,
    message: "Translations data is missing",
  },
  MISSING_ENGLISH: {
    code: "ERR_MISSING_ENGLISH",
    status: 400,
    message: "English translation is required",
  },
  INVALID_LEVEL: {
    code: "ERR_INVALID_LEVEL",
    status: 400,
    message: "Invalid level. Allowed values: B2 or C1.",
  },
  WORDS_MISSING: {
    code: "ERR_WORDS_MISSING",
    status: 404,
    message: "Words missing",
  },
  TRANSLATION_MISSING: {
    code: "ERR_TRANSLATION_MISSING",
    status: 404,
    message: "Translation is missing",
  },
  NO_RECORDS: {
    code: "ERR_NO_RECORDS",
    status: 404,
    message: "No records found",
  },
  ALREADY_LEARNED: {
    code: "ERR_ALREADY_LEARNED",
    status: 400,
    message: "You have already learned this word.",
  },
  NO_AUTOSAVE: {
    code: "ERR_NO_AUTOSAVE",
    status: 404,
    message: "No autosave data found",
  },
  ACCOUNT_BANNED: {
    code: "ERR_ACCOUNT_BANNED",
    status: 403,
    message: "Account banned",
  },
  REPORT_NOT_FOUND: {
    code: "ERR_REPORT_NOT_FOUND",
    status: 404,
    message: "Report not found.",
  },
  FETCH_TRANSLATIONS: {
    code: "ERR_FETCH_TRANSLATIONS",
    status: 500,
    message: "Error fetching translations",
  },
  INVALID_INPUT: {
    code: "ERR_INVALID_INPUT",
    status: 400,
    message: "Invalid input",
  },
  WORD_NOT_FOUND: {
    code: "ERR_WORD_NOT_FOUND",
    status: 404,
    message: "Word not found",
  },
  USER_NOT_FOUND: {
    code: "ERR_USER_NOT_FOUND",
    status: 404,
    message: "User not found.",
  },
  SERVER: {
    code: "ERR_SERVER",
    status: 500,
    message: "Internal server error",
  },
  LOGIN_USERNAME_LENGTH: {
    code: "ERR_LOGIN_USERNAME_LENGTH",
    status: 400,
    message: "Username must be between {min} and {max} characters",
  },
  LOGIN_USERNAME_INVALID_CHARS: {
    code: "ERR_LOGIN_USERNAME_INVALID_CHARS",
    status: 400,
    message: "Username contains invalid characters",
  },
  LOGIN_PASSWORD_LENGTH: {
    code: "ERR_LOGIN_PASSWORD_LENGTH",
    status: 400,
    message: "Password must be between {min} and {max} characters",
  },
  USERNAME_LENGTH: {
    code: "ERR_USERNAME_LENGTH",
    status: 400,
    message: "Username must be between {min} and {max} characters.",
  },
  USERNAME_INVALID_CHARS: {
    code: "ERR_USERNAME_INVALID_CHARS",
    status: 400,
    message: "Username can only contain letters, numbers, and underscores.",
  },
  INVALID_EMAIL: {
    code: "ERR_INVALID_EMAIL",
    status: 400,
    message: "E-mail address is invalid",
  },
  EMAIL_TOO_LONG: {
    code: "ERR_EMAIL_TOO_LONG",
    status: 400,
    message: "Email cannot be longer than {max} characters.",
  },
  PASSWORD_LENGTH: {
    code: "ERR_PASSWORD_LENGTH",
    status: 400,
    message: "Password must be between {min} and {max} characters",
  },
  PASSWORD_UPPERCASE: {
    code: "ERR_PASSWORD_UPPERCASE",
    status: 400,
    message: "Password must contain an uppercase letter",
  },
  PASSWORD_LOWERCASE: {
    code: "ERR_PASSWORD_LOWERCASE",
    status: 400,
    message: "Password must contain a lowercase letter",
  },
  PASSWORD_DIGIT: {
    code: "ERR_PASSWORD_DIGIT",
    status: 400,
    message: "Password must contain a digit",
  },
  PASSWORD_SPECIAL_CHAR: {
    code: "ERR_PASSWORD_SPECIAL_CHAR",
    status: 400,
    message: "Password must contain a special character",
  },
  INVALID_EMAIL_FORMAT: {
    code: "ERR_INVALID_EMAIL_FORMAT",
    status: 400,
    message: "Invalid email format.",
  },
  INVALID_LANGUAGE: {
    code: "ERR_INVALID_LANGUAGE",
    status: 400,
    message: "Unsupported language",
  },
  MISSING_USERNAME: {
    code: "ERR_MISSING_USERNAME",
    status: 400,
    message: "Username is required.",
  },
  INTERNAL_SERVER: {
    code: "ERR_INTERNAL_SERVER",
    status: 500,
    message: "Internal Server Error.",
  },
  PASSWORD_MISMATCH: {
    code: "ERR_PASSWORD_MISMATCH",
    status: 400,
    message: "Passwords do not match",
  },
  INVALID_AVATAR: {
    code: "ERR_INVALID_AVATAR",
    status: 400,
    message: "Avatar must be an integer between 1 and 4",
  },
  MISSING_USER_ID: {
    code: "ERR_MISSING_USER_ID",
    status: 400,
    message: "User ID not provided.",
  },
  RESET_TOKEN_REQUIRED: {
    code: "ERR_RESET_TOKEN_REQUIRED",
    status: 400,
    message: "Reset token is required.",
  },
  RESET_PASSWORD_LENGTH: {
    code: "ERR_RESET_PASSWORD_LENGTH",
    status: 400,
    message: "Password must be between {min} and {max} characters.",
  },
  RESET_PASSWORD_UPPERCASE: {
    code: "ERR_RESET_PASSWORD_UPPERCASE",
    status: 400,
    message: "Password must contain an uppercase letter.",
  },
  RESET_PASSWORD_LOWERCASE: {
    code: "ERR_RESET_PASSWORD_LOWERCASE",
    status: 400,
    message: "Password must contain a lowercase letter.",
  },
  RESET_PASSWORD_DIGIT: {
    code: "ERR_RESET_PASSWORD_DIGIT",
    status: 400,
    message: "Password must contain a digit.",
  },
  RESET_PASSWORD_SPECIAL: {
    code: "ERR_RESET_PASSWORD_SPECIAL",
    status: 400,
    message: "Password must contain a special character.",
  },
  PAGE_NAME_MISSING: {
    code: "ERR_PAGE_NAME_MISSING",
    status: 400,
    message: "Parameter 'page_name' is required.",
  },
  PAGE_NAME_NOT_STRING: {
    code: "ERR_PAGE_NAME_NOT_STRING",
    status: 400,
    message: "Parameter 'page_name' must be a string.",
  },
  PAGE_NAME_INVALID: {
    code: "ERR_PAGE_NAME_INVALID",
    status: 400,
    message: "Invalid 'page_name' value.",
  },
  REPORT_ID_REQUIRED: {
    code: "ERR_REPORT_ID_REQUIRED",
    status: 400,
    message: "Report ID is required.",
  },
  REPORT_ID_INVALID: {
    code: "ERR_REPORT_ID_INVALID",
    status: 400,
    message: "Report ID must be a positive integer.",
  },
  REPORT_OBJECT_REQUIRED: {
    code: "ERR_REPORT_OBJECT_REQUIRED",
    status: 400,
    message: "Report object is required.",
  },
  REPORT_OBJECT_NOT_OBJECT: {
    code: "ERR_REPORT_OBJECT_NOT_OBJECT",
    status: 400,
    message: "Report must be an object.",
  },
  TRANSLATIONS_REQUIRED: {
    code: "ERR_TRANSLATIONS_REQUIRED",
    status: 400,
    message: "Translations data is missing.",
  },
  TRANSLATIONS_NOT_ARRAY: {
    code: "ERR_TRANSLATIONS_NOT_ARRAY",
    status: 400,
    message: "Translations must be a non-empty array.",
  },
  TRANSLATION_TEXT_REQUIRED: {
    code: "ERR_TRANSLATION_TEXT_REQUIRED",
    status: 400,
    message: "Each translation must have a translation text.",
  },
  TRANSLATION_TEXT_NOT_STRING: {
    code: "ERR_TRANSLATION_TEXT_NOT_STRING",
    status: 400,
    message: "Translation text must be a string.",
  },
  TRANSLATION_TEXT_TOO_LONG: {
    code: "ERR_TRANSLATION_TEXT_TOO_LONG",
    status: 400,
    message: "Translation cannot exceed 500 characters.",
  },
  DESCRIPTION_NOT_STRING: {
    code: "ERR_DESCRIPTION_NOT_STRING",
    status: 400,
    message: "Description must be a string.",
  },
  DESCRIPTION_TOO_LONG: {
    code: "ERR_DESCRIPTION_TOO_LONG",
    status: 400,
    message: "Description cannot exceed 1000 characters.",
  },
  WORD_ID_REQUIRED: {
    code: "ERR_WORD_ID_REQUIRED",
    status: 400,
    message: "Word ID is required.",
  },
  WORD_ID_INVALID: {
    code: "ERR_WORD_ID_INVALID",
    status: 400,
    message: "Word ID must be a positive integer less than 100000.",
  },
  WORD_ID_NOT_FOUND: {
    code: "ERR_WORD_ID_NOT_FOUND",
    status: 404,
    message: "word_id not found in database.",
  },
  LANGUAGE_REQUIRED: {
    code: "ERR_LANGUAGE_REQUIRED",
    status: 400,
    message: "Each translation must include a language.",
  },
  LANGUAGE_INVALID: {
    code: "ERR_LANGUAGE_INVALID",
    status: 400,
    message: "Language must be 'pl' or 'en'.",
  },
  INVALID_REPORT_TYPE: {
    code: "ERR_INVALID_REPORT_TYPE",
    status: 400,
    message: "Invalid reportType. Allowed values are 'other' and 'word_issue'.",
  },
  MISSING_DESCRIPTION: {
    code: "ERR_MISSING_DESCRIPTION",
    status: 400,
    message: "Description is required for reportType 'other'.",
  },
  MISSING_WORD: {
    code: "ERR_MISSING_WORD",
    status: 400,
    message: "Word is required for reportType 'word_issue'.",
  },
  INVALID_DESCRIPTION: {
    code: "ERR_INVALID_DESCRIPTION",
    status: 400,
    message: "Description cannot be empty after sanitization.",
  },
  USER_ID_REQUIRED: {
    code: "ERR_USER_ID_REQUIRED",
    status: 400,
    message: "User ID is required.",
  },
  USER_ID_INVALID: {
    code: "ERR_USER_ID_INVALID",
    status: 400,
    message: "User ID must be a positive integer less than 1,000,000.",
  },
  EDITED_ROWS_REQUIRED: {
    code: "ERR_EDITED_ROWS_REQUIRED",
    status: 400,
    message: "editedRows is required.",
  },
  EDITED_ROWS_NOT_ARRAY: {
    code: "ERR_EDITED_ROWS_NOT_ARRAY",
    status: 400,
    message: "editedRows must be an array.",
  },
  EDITED_ROWS_EMPTY: {
    code: "ERR_EDITED_ROWS_EMPTY",
    status: 400,
    message: "editedRows cannot be empty.",
  },
  USERNAME_REQUIRED: {
    code: "ERR_USERNAME_REQUIRED",
    status: 400,
    message: "Username is required.",
  },
  USERNAME_NOT_STRING: {
    code: "ERR_USERNAME_NOT_STRING",
    status: 400,
    message: "Username must be a string.",
  },
  EMAIL_REQUIRED: {
    code: "ERR_EMAIL_REQUIRED",
    status: 400,
    message: "Email is required.",
  },
  ROLE_REQUIRED: {
    code: "ERR_ROLE_REQUIRED",
    status: 400,
    message: "Role is required.",
  },
  ROLE_INVALID: {
    code: "ERR_ROLE_INVALID",
    status: 400,
    message: "Role must be 'admin', 'user' or 'moderator'.",
  },
  BAN_REQUIRED: {
    code: "ERR_BAN_REQUIRED",
    status: 400,
    message: "Ban status is required.",
  },
  BAN_INVALID: {
    code: "ERR_BAN_INVALID",
    status: 400,
    message: "Ban must be true or false.",
  },
  LEVEL_REQUIRED: {
    code: "ERR_LEVEL_REQUIRED",
    status: 400,
    message: "Level is required.",
  },
  LEVEL_INVALID: {
    code: "ERR_LEVEL_INVALID",
    status: 400,
    message: "Invalid level. Allowed values: B2, C1.",
  },
  DEVICE_ID_REQUIRED: {
    code: "ERR_DEVICE_ID_REQUIRED",
    status: 400,
    message: "Device ID is required.",
  },
  DEVICE_ID_INVALID: {
    code: "ERR_DEVICE_ID_INVALID",
    status: 400,
    message: "Invalid device ID format. Expected UUID v4.",
  },
  WORDS_REQUIRED: {
    code: "ERR_WORDS_REQUIRED",
    status: 400,
    message: "Words array is required.",
  },
  WORDS_NOT_ARRAY: {
    code: "ERR_WORDS_NOT_ARRAY",
    status: 400,
    message: "Words must be a non-empty array.",
  },
  BOX_NAME_INVALID: {
    code: "ERR_BOX_NAME_INVALID",
    status: 400,
    message: "Invalid boxName.",
  },
  PATCH_NUMBER_REQUIRED: {
    code: "ERR_PATCH_NUMBER_REQUIRED",
    status: 400,
    message: "Patch number is required.",
  },
  PATCH_NUMBER_INVALID: {
    code: "ERR_PATCH_NUMBER_INVALID",
    status: 400,
    message: "Patch number must be a non-negative integer.",
  },
  INVALID_PAGE: {
    code: "ERR_INVALID_PAGE",
    status: 400,
    message: "Invalid page parameter. It must be a positive integer.",
  },
  INVALID_LIMIT: {
    code: "ERR_INVALID_LIMIT",
    status: 400,
    message: "Invalid limit parameter. It must be a positive integer.",
  },
  WORD_OBJECT_REQUIRED: {
    code: "ERR_WORD_OBJECT_REQUIRED",
    status: 400,
    message: "Word object is required.",
  },
  WORD_NOT_OBJECT: {
    code: "ERR_WORD_NOT_OBJECT",
    status: 400,
    message: "Word must be an object.",
  },
  LANGUAGE_NOT_STRING: {
    code: "ERR_LANGUAGE_NOT_STRING",
    status: 400,
    message: "Language must be a string.",
  },
  TRANSLATION_LANGUAGE_REQUIRED: {
    code: "ERR_TRANSLATION_LANGUAGE_REQUIRED",
    status: 400,
    message: "Each translation must have a language.",
  },
  TRANSLATION_LANGUAGE_NOT_STRING: {
    code: "ERR_TRANSLATION_LANGUAGE_NOT_STRING",
    status: 400,
    message: "Language must be a string.",
  },
  ENGLISH_TRANSLATION_REQUIRED: {
    code: "ERR_ENGLISH_TRANSLATION_REQUIRED",
    status: 400,
    message: "English translation is required.",
  },
  WORD_LEVEL_REQUIRED: {
    code: "ERR_WORD_LEVEL_REQUIRED",
    status: 400,
    message: "Word level is required.",
  },
  WORD_LEVEL_INVALID: {
    code: "ERR_WORD_LEVEL_INVALID",
    status: 400,
    message: "Word level must be either 'B2' or 'C1'.",
  },
  MISSING_PARAMS: {
    code: "ERR_MISSING_PARAMS",
    status: 403,
    message: "Access denied. Both patchNumber and level must be provided.",
  },
  INVALID_WORD_LIST: {
    code: "ERR_INVALID_WORD_LIST",
    status: 400,
    message: "Invalid wordList. It must be a non-empty array.",
  },
};