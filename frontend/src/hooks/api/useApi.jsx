import { useIntl } from 'react-intl';
import api from '../../utils/api';

export const useApi = () => {
  const intl = useIntl();

  const handleError = (error) => {
    const errorCode = error.response?.data?.code || 'error.unknown';
    const message = intl.formatMessage({ id: errorCode });
    
    console.error('API Error:', {
      code: errorCode,
      message: message,
      originalError: error
    });
    
    return { error: true, message };
  };

  const wrappedRequest = async (method, ...args) => {
    try {
      const response = await method(...args);
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  };

  return {
    get: (...args) => wrappedRequest(api.get, ...args),
    post: (...args) => wrappedRequest(api.post, ...args),
    patch: (...args) => wrappedRequest(api.patch, ...args),
    delete: (...args) => wrappedRequest(api.delete, ...args),
  };
};