import { useEffect } from 'react';
import { useAuth } from '../Auth0/AuthProvider';
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:6001/api',
});

const useAxiosInterceptor = (empresaId) => {
  const { token } = useAuth(); // Obtener el token desde el contexto

  console.log("empresaId en axiosconfig:", empresaId);

  useEffect(() => {
    if (token && empresaId) {
      const requestInterceptor = api.interceptors.request.use(
        (config) => {
          console.log('Headers antes de la solicitud:', config.headers);
          config.headers.Authorization = `Bearer ${token}`;
          config.headers['X-Empresa-Id'] = empresaId;
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Limpieza del interceptor en el desmontaje
      return () => {
        api.interceptors.request.eject(requestInterceptor);
      };
    }
  }, [token, empresaId]);  // Re-configura el interceptor cuando cambie el token o el empresaId

  return api;
};

export default useAxiosInterceptor;
