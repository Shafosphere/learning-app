let intlInstance = null;

export const registerIntl = (intl) => {
  intlInstance = intl;
};

export const translate = (id, defaultMessage, params = {}) => {
  if (!intlInstance) {
    console.error("Intl instance not registered!");
    return defaultMessage;
  }
  return intlInstance.formatMessage({ id, defaultMessage }, params); // <-- Dodajemy params
};
