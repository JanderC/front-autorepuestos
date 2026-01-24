import { useAuth } from '../context/AuthContext';
import { apiCall } from '../services/api';

export const useApi = () => {
  const { token } = useAuth();

  const makeRequest = async (url, options = {}) => {
    return apiCall(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
  };

  return makeRequest;
};

export default useApi;