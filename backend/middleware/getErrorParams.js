import VALIDATION_RULES from "./validators/validationConfig.js";
export function getErrorParams(msg) {
  switch (msg) {
    case "ERR_LOGIN_USERNAME_LENGTH":
      return {
        min: VALIDATION_RULES.USERNAME.MIN_LENGTH,
        max: VALIDATION_RULES.USERNAME.MAX_LENGTH,
      };
    case "ERR_LOGIN_USERNAME_INVALID_CHARS":
      return {};
    case "ERR_LOGIN_PASSWORD_LENGTH":
      return {
        min: VALIDATION_RULES.PASSWORD.MIN_LENGTH,
        max: VALIDATION_RULES.PASSWORD.MAX_LENGTH,
      };
    default:
      return {};
  }
}
