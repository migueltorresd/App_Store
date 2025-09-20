import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginData, RegisterData, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  
  // Usuarios mock para demo (simulando base de datos local)
  private mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@electrostore.com',
      nombre: 'Administrador',
      apellido: 'ElectroStore',
      telefono: '+57 300 1234567',
      fechaCreacion: new Date('2024-01-01'),
      activo: true
    }
  ];
  
  // Observables públicos
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Verificar si hay una sesión guardada al inicializar
    this.checkStoredSession();
  }

  /**
   * Verificar si hay una sesión almacenada en localStorage
   */
  private checkStoredSession(): void {
    const storedUser = localStorage.getItem('electrostore_user');
    const storedToken = localStorage.getItem('electrostore_token');
    
    if (storedUser && storedToken) {
      try {
        const user: User = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
        console.log('✅ Sesión restaurada para:', user.email);
      } catch (error) {
        console.error('❌ Error al restaurar sesión:', error);
        this.clearSession();
      }
    }
  }

  /**
   * Iniciar sesión
   */
  login(loginData: LoginData): Observable<AuthResponse> {
    console.log('🔐 Intentando login para:', loginData.email);
    
    // Simular llamada a API con delay
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        // Buscar usuario en datos mock
        const user = this.mockUsers.find(u => u.email === loginData.email);
        
        if (user && this.validatePassword(loginData.password)) {
          // Login exitoso
          const token = this.generateMockToken();
          
          // Guardar en localStorage
          localStorage.setItem('electrostore_user', JSON.stringify(user));
          localStorage.setItem('electrostore_token', token);
          
          // Actualizar estado
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          
          observer.next({
            success: true,
            message: `¡Bienvenido ${user.nombre}!`,
            user,
            token
          });
        } else {
          // Login fallido
          observer.next({
            success: false,
            message: 'Email o contraseña incorrectos'
          });
        }
        
        observer.complete();
      }, 1500); // Simular delay de red
    });
  }

  /**
   * Registrar nuevo usuario
   */
  register(registerData: RegisterData): Observable<AuthResponse> {
    console.log('📝 Registrando nuevo usuario:', registerData.email);
    
    return new Observable<AuthResponse>(observer => {
      setTimeout(() => {
        // Validaciones
        if (registerData.password !== registerData.confirmPassword) {
          observer.next({
            success: false,
            message: 'Las contraseñas no coinciden'
          });
          observer.complete();
          return;
        }
        
        // Verificar si el email ya existe
        const existingUser = this.mockUsers.find(u => u.email === registerData.email);
        if (existingUser) {
          observer.next({
            success: false,
            message: 'Este email ya está registrado'
          });
          observer.complete();
          return;
        }
        
        // Crear nuevo usuario
        const newUser: User = {
          id: (this.mockUsers.length + 1).toString(),
          email: registerData.email,
          nombre: registerData.nombre,
          apellido: registerData.apellido,
          telefono: registerData.telefono,
          fechaCreacion: new Date(),
          activo: true
        };
        
        // Agregar a la lista mock
        this.mockUsers.push(newUser);
        
        // Generar token y guardar sesión
        const token = this.generateMockToken();
        localStorage.setItem('electrostore_user', JSON.stringify(newUser));
        localStorage.setItem('electrostore_token', token);
        
        // Actualizar estado
        this.currentUserSubject.next(newUser);
        this.isAuthenticatedSubject.next(true);
        
        observer.next({
          success: true,
          message: `¡Registro exitoso! Bienvenido ${newUser.nombre}`,
          user: newUser,
          token
        });
        
        observer.complete();
      }, 2000); // Simular delay de red más largo para registro
    });
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    console.log('🚪 Cerrando sesión...');
    this.clearSession();
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Limpiar sesión
   */
  private clearSession(): void {
    localStorage.removeItem('electrostore_user');
    localStorage.removeItem('electrostore_token');
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Validar contraseña (mock - en producción usar hash)
   */
  private validatePassword(password: string): boolean {
    // Para demo, cualquier contraseña con al menos 6 caracteres es válida
    return password.length >= 6;
  }

  /**
   * Generar token mock
   */
  private generateMockToken(): string {
    return 'electrostore_' + Math.random().toString(36).substr(2, 9) + Date.now();
  }
}
