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
  private readonly USERS_STORAGE_KEY = 'techstore_users';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router) {
    // Inicializar usuarios por defecto si no existen
    this.initializeDefaultUsers();
    // Verificar si hay token almacenado al inicializar
    this.checkStoredAuth();
  }

  /**
   * Verificar autenticación almacenada
   */
  public checkStoredAuth(): void {
    console.log('🔍 AuthService: Verificando autenticación almacenada...');
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    
    console.log('  - Token en localStorage:', token ? 'Existe' : 'No existe');
    console.log('  - User en localStorage:', user ? 'Existe' : 'No existe');
    
    if (token && user) {
      try {
        const userObj = JSON.parse(user);
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(userObj);
        console.log('✅ AuthService: Usuario autenticado desde localStorage:', userObj.email);
      } catch (error) {
        console.error('❌ AuthService: Error parseando usuario desde localStorage:', error);
        this.isAuthenticatedSubject.next(false);
        this.currentUserSubject.next(null);
      }
    } else {
      console.log('🚫 AuthService: No hay autenticación almacenada');
      this.isAuthenticatedSubject.next(false);
      this.currentUserSubject.next(null);
    }
  }

  /**
   * Inicializar usuarios por defecto
   */
  private initializeDefaultUsers(): void {
    const existingUsers = this.getStoredUsers();
    if (existingUsers.length === 0) {
      const defaultUsers = [
        { 
          id: 'admin_001', 
          email: 'admin@techstore.com', 
          password: '123456', 
          name: 'Admin TechStore', 
          role: 'admin',
          createdAt: new Date().toISOString()
        },
        { 
          id: 'user_001', 
          email: 'user@test.com', 
          password: '123456', 
          name: 'Usuario Test', 
          role: 'user',
          createdAt: new Date().toISOString()
        },
        { 
          id: 'demo_001', 
          email: 'demo@techstore.com', 
          password: 'Demo123', 
          name: 'Usuario Demo', 
          role: 'user',
          createdAt: new Date().toISOString()
        }
      ];
      this.saveUsers(defaultUsers);
      console.log('✅ Usuarios por defecto inicializados');
    } else {
      console.log('📋 Usuarios existentes cargados:', existingUsers.length);
    }
  }

  /**
   * Obtener usuarios almacenados
   */
  private getStoredUsers(): any[] {
    try {
      const usersStr = localStorage.getItem(this.USERS_STORAGE_KEY);
      return usersStr ? JSON.parse(usersStr) : [];
    } catch (error) {
      console.error('❌ Error obteniendo usuarios almacenados:', error);
      return [];
    }
  }

  /**
   * Guardar usuarios en localStorage
   */
  private saveUsers(users: any[]): void {
    try {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('❌ Error guardando usuarios:', error);
    }
  }

  /**
   * Agregar nuevo usuario
   */
  private addUser(user: any): void {
    const users = this.getStoredUsers();
    users.push(user);
    this.saveUsers(users);
  }

  /**
   * Verificar si email existe
   */
  private emailExists(email: string): boolean {
    const users = this.getStoredUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  /**
   * Login de usuario - Con persistencia
   */
  login(loginData: LoginData): Observable<AuthResponse> {
    return new Observable(observer => {
      // Simular delay de red
      setTimeout(() => {
        // Obtener usuarios almacenados
        const storedUsers = this.getStoredUsers();
        console.log('🔍 Buscando usuario en', storedUsers.length, 'usuarios almacenados');

        const user = storedUsers.find(u => 
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
   * Registro de usuario - Con persistencia
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    return new Promise((resolve) => {
      // Simular delay de red
      setTimeout(() => {
        // Verificar si el email ya existe
        if (this.emailExists(registerData.email)) {
          console.log('❌ Email ya existe:', registerData.email);
          resolve({
            success: false,
            message: 'Este email ya está registrado',
            error: 'EMAIL_EXISTS'
          });
          return;
        }

        // Crear nuevo usuario
        const newUser = {
          id: 'user_' + Date.now(),
          name: registerData.name,
          email: registerData.email,
          password: registerData.password, // Guardar password para futuras autenticaciones
          role: 'user',
          createdAt: new Date().toISOString()
        };

        // Guardar usuario en la base de datos local
        this.addUser(newUser);
        console.log('✅ Usuario registrado y guardado:', newUser.email);

        const token = 'mock_jwt_token_' + Date.now();

        // Almacenar datos de sesión (sin password por seguridad)
        const sessionUser = {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          createdAt: newUser.createdAt
        };
        localStorage.setItem('auth_token', token);
        localStorage.setItem('current_user', JSON.stringify(sessionUser));

        // Actualizar estado
        this.isAuthenticatedSubject.next(true);
        this.currentUserSubject.next(sessionUser);

        resolve({
          success: true,
          message: `¡Cuenta creada exitosamente! Bienvenido ${sessionUser.name}`,
          token,
          user: sessionUser
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
    const result = !!(token && user);
    
    console.log('🔒 AuthService.isAuthenticated() verificación:');
    console.log('  - Token:', token ? 'Existe' : 'No existe');
    console.log('  - User:', user ? 'Existe' : 'No existe'); 
    console.log('  - Resultado:', result);
    
    return result;
  }

  /**
   * Método de desarrollo - Limpiar todos los datos de usuarios
   * SOLO PARA DESARROLLO/TESTING
   */
  public clearAllUsers(): void {
    localStorage.removeItem(this.USERS_STORAGE_KEY);
    console.log('🗑️ Todos los usuarios han sido eliminados (solo desarrollo)');
  }

  /**
   * Método de desarrollo - Obtener todos los usuarios registrados
   * SOLO PARA DESARROLLO/TESTING
   */
  public getAllUsers(): any[] {
    return this.getStoredUsers().map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
      // Password omitido por seguridad
    }));
  }
}
