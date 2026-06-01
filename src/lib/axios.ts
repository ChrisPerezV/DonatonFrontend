import axios from 'axios';
import Cookies from 'js-cookie';

// Apuntamos al API Gateway que construiste
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Se ejecuta ANTES de que cualquier petición salga hacia el backend
api.interceptors.request.use(
  (config) => {
    // Buscamos el token en las cookies
    const token = Cookies.get('token');
    
    // Si existe, se lo pegamos al encabezado (Tu "Pase VIP")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;