// Interfaz para el modelo de usuario
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fechaCreacion: Date;
  activo: boolean;
}

// Interfaz para el login
export interface LoginData {
  email: string;
  password: string;
}

// Interfaz para el registro
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  nombre: string;
  apellido: string;
  telefono?: string;
}

// Interfaz para la respuesta de autenticación
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}