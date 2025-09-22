import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Verificar si hay token almacenado al inicializar
    this.checkStoredAuth();
  }

  /**
   * Verificar autenticación almacenada
   */
  private checkStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    
    if (token && user) {
      this.isAuthenticatedSubject.next(true);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  /**
   * Login de usuario - Simulación con datos mock
   */
  login(loginData: LoginData): Observable<AuthResponse> {
    return new Observable(observer => {
      // Simular delay de red
      setTimeout(() => {
        // Usuarios mock para pruebas
        const mockUsers = [
          { email: 'admin@techstore.com', password: '123456', name: 'Admin TechStore', role: 'admin' },
          { email: 'user@test.com', password: '123456', name: 'Usuario Test', role: 'user' },
          { email: 'demo@techstore.com', password: 'Demo123', name: 'Usuario Demo', role: 'user' }
        ];

        const user = mockUsers.find(u => 
          u.email.toLowerCase() === loginData.email.toLowerCase() && 
          u.password === loginData.password
        );

        if (user) {
          // Generar token mock
          const token = 'mock_jwt_token_' + Date.now();
          
          // Almacenar en localStorage
          localStorage.setItem('auth_token', token);
          localStorage.setItem('current_user', JSON.stringify(user));
          
          // Actualizar estado
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(user);

          observer.next({
            success: true,
            message: `¡Bienvenido ${user.name}!`,
            token,
            user
          });
        } else {
          observer.next({
            success: false,
            message: 'Email o contraseña incorrectos',
            error: 'INVALID_CREDENTIALS'
          });
        }
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Registro de usuario - Simulación
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    return new Promise((resolve) => {
      // Simular delay de red
      setTimeout(() => {
        // Verificar si el email ya existe (simulación)
        const existingEmails = [
          'admin@techstore.com',
          'existing@user.com'
        ];

        if (existingEmails.includes(registerData.email.toLowerCase())) {
          resolve({
            success: false,
            message: 'Este email ya está registrado',
            error: 'EMAIL_EXISTS'
          });
          return;
        }

        // Simular registro exitoso
        const newUser = {
          id: Date.now(),
          name: registerData.name,
          email: registerData.email,
          role: 'user',
          createdAt: new Date().toISOString()
        };

        const token = 'mock_jwt_token_' + Date.now();

        // Almacenar datos
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(newUser));

        // Actualizar estado
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(newUser);

        resolve({
          success: true,
          message: `¡Cuenta creada exitosamente! Bienvenido ${newUser.name}`,
          token,
          user: newUser
        });
      }, 1500);
    });
  }

  /**
   * Registro con Google - Simulación
   */
  async signInWithGoogle(): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const googleUser = {
          id: 'google_' + Date.now(),
          name: 'Usuario Google',
          email: 'usuario@gmail.com',
          role: 'user',
          provider: 'google',
          createdAt: new Date().toISOString()
        };

        const token = 'google_mock_token_' + Date.now();

        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(googleUser));

        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(googleUser);

        resolve({
          success: true,
          message: 'Registro exitoso con Google',
          token,
          user: googleUser
        });
      }, 2000);
    });
  }

  /**
   * Registro con Facebook - Simulación
   */
  async signInWithFacebook(): Promise<AuthResponse> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const facebookUser = {
          id: 'facebook_' + Date.now(),
          name: 'Usuario Facebook',
          email: 'usuario@facebook.com',
          role: 'user',
          provider: 'facebook',
          createdAt: new Date().toISOString()
        };

        const token = 'facebook_mock_token_' + Date.now();

        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(facebookUser));

        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(facebookUser);

        resolve({
          success: true,
          message: 'Registro exitoso con Facebook',
          token,
          user: facebookUser
        });
      }, 2000);
    });
  }

  /**
   * Cerrar sesión
   */
  async logout(): Promise<void> {
    // Limpiar localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');

    // Actualizar estado
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);

    // Redireccionar a login
    await this.router.navigate(['/login'], { replaceUrl: true });
  }

  /**
   * Obtener token actual
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): any {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }
}