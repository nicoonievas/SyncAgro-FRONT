import axios from 'axios';
import { useEffect } from 'react';
import { useAuth } from '../Auth0/AuthProvider';

const api = axios.create({
  baseURL: 'http://localhost:6001/api',
});

const useAxiosInterceptor = () => {
  const { token } = useAuth(); // Obtener el token desde el contexto

  useEffect(() => {
    if (token) {
      api.interceptors.request.use(
        (config) => {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('Token set in header:', token);
          return config;
        },
        (error) => Promise.reject(error)
      );
    }
  }, [token]);

  return api;
};

export default useAxiosInterceptor;
