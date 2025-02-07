// validationConfig.js
const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 50,
    REGEX: {
      UPPER: /[A-Z]/,
      LOWER: /[a-z]/,
      DIGIT: /[0-9]/,
      SPECIAL: /[\W_]/,
    },
  },
  EMAIL: {
    MAX_LENGTH: 255,
  },
  USERNAME: {
    MIN_LENGTH: 4,
    MAX_LENGTH: 20,
    REGEX: /^[a-zA-Z0-9_]+$/,
  },
};

export default VALIDATION_RULES;
