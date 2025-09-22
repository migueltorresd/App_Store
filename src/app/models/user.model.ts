// Interfaz para el modelo de usuario
export interface User {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  avatar?: string;
  fechaCreacion: Date;
  ultimoAcceso?: Date;
  activo: boolean;
  rol: UserRole;
  preferencias?: UserPreferences;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

export interface UserPreferences {
  tema: 'light' | 'dark' | 'auto';
  notificaciones: boolean;
  idioma: string;
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

// Interfaz para la respuesta de autenticación con JWT
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

// Interfaz para el payload del JWT
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  nombre: string;
  rol: UserRole;
  iat: number; // issued at
  exp: number; // expiration
}

// Interfaz para refresh token
export interface RefreshTokenData {
  refreshToken: string;
}

// Interfaz para validación de contraseña
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
}

// Interfaz para cambio de contraseña
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
