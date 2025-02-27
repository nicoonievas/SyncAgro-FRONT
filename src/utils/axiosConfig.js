import axios from 'axios';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const api = axios.create({
  baseURL: 'http://localhost:6001/api',  // Base URL de tu API
});

const useAxiosInterceptor = () => {
  const { getIdTokenClaims } = useAuth0();
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      const tokenClaims = await getIdTokenClaims();  // Obtener las claims del token
      setToken(tokenClaims?.__raw || "");  // Guardar el token en el estado
      console.log('Token obtained:', tokenClaims?.__raw);
    };

    fetchToken();
  }, [getIdTokenClaims]);

  useEffect(() => {
    if (token) {
      const setupInterceptor = () => {
        api.interceptors.request.use(
          (config) => {
            if (token) {
              // Añadir el token en la cabecera Authorization como Bearer <token>
              config.headers.Authorization = `Bearer ${token}`;
              console.log('Token set in header:', token);
            } else {
              console.log('No token available');
            }
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
      };

      setupInterceptor();
    }
  }, [token]);

  return api;  // Retornar la instancia configurada de Axios
};

export default useAxiosInterceptor;
