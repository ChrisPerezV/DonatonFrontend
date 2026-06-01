export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  idUsuario: string;
  rol: string;
}