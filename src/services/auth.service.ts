import api from '../lib/axios';
import { LoginRequest, AuthResponse } from '../types/auth.types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    // Hace el POST a http://localhost:8080/api/v1/usuarios/login
    const response = await api.post<AuthResponse>('/usuarios/login', credentials);
    return response.data;
  }
};