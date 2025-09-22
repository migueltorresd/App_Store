import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginData, RegisterData, AuthResponse, UserRole, JwtPayload } from '../models/user.model';
import { JwtService } from './jwt';

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
      ultimoAcceso: new Date(),
      activo: true,
      rol: UserRole.ADMIN,
      preferencias: {
        tema: 'auto',
        notificaciones: true,
        idioma: 'es'
      }
    },
    {
      id: '2',
      email: 'user@electrostore.com',
      nombre: 'Usuario',
      apellido: 'Demo',
      telefono: '+57 300 9876543',
      fechaCreacion: new Date('2024-01-15'),
      ultimoAcceso: new Date(),
      activo: true,
      rol: UserRole.USER,
      preferencias: {
        tema: 'light',
        notificaciones: true,
        idioma: 'es'
      }
    }
  ];
  
  // Observables públicos
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private jwtService: JwtService) {
    // Verificar si hay una sesión guardada al inicializar
    this.initializeAuth();
    console.log('🔐 AuthService inicializado con JWT');
  }

  /**
   * Inicializar autenticación de forma asíncrona
   */
  private async initializeAuth(): Promise<void> {
    await this.checkStoredSession();
  }

  /**
   * Verificar si hay una sesión almacenada usando JWT
   */
  private async checkStoredSession(): Promise<void> {
    try {
      const hasValidTokens = await this.jwtService.hasValidTokens();
      
      if (hasValidTokens) {
        const jwtPayload = await this.jwtService.getCurrentUserFromToken();
        
        if (jwtPayload) {
          // Buscar el usuario completo usando el payload del JWT
          const user = this.mockUsers.find(u => u.id === jwtPayload.sub);
          
          if (user) {
            // Actualizar último acceso
            user.ultimoAcceso = new Date();
            
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            console.log('✅ Sesión JWT restaurada para:', user.email);
          } else {
            console.warn('⚠️ Usuario no encontrado para el token JWT');
            await this.clearSession();
          }
        }
      } else {
        console.log('ℹ️ No hay tokens válidos almacenados');
        await this.clearSession();
      }
    } catch (error) {
      console.error('❌ Error verificando sesión JWT:', error);
      await this.clearSession();
    }
  }

  /**
   * Iniciar sesión con JWT
   */
  login(loginData: LoginData): Observable<AuthResponse> {
    console.log('🔐 Intentando login JWT para:', loginData.email);
    
    // Simular llamada a API con delay
    return new Observable<AuthResponse>(observer => {
      setTimeout(async () => {
        try {
          // Buscar usuario en datos mock
          const user = this.mockUsers.find(u => u.email === loginData.email);
          
          if (user && this.validatePassword(loginData.password)) {
            // Actualizar último acceso
            user.ultimoAcceso = new Date();
            
            // Generar tokens JWT
            const accessToken = this.jwtService.generateMockToken(
              user.id, 
              user.email, 
              user.nombre, 
              user.rol
            );
            
            const refreshToken = this.generateRefreshToken();
            
            // Guardar tokens de forma segura
            await this.jwtService.saveAccessToken(accessToken);
            await this.jwtService.saveRefreshToken(refreshToken);
            
            // Actualizar estado
            this.currentUserSubject.next(user);
            this.isAuthenticatedSubject.next(true);
            
            observer.next({
              success: true,
              message: `¡Bienvenido ${user.nombre}!`,
              user,
              accessToken,
              refreshToken,
              expiresIn: 24 * 60 * 60 // 24 horas en segundos
            });
            
            console.log('✅ Login JWT exitoso para:', user.email);
          } else {
            // Login fallido
            observer.next({
              success: false,
              message: 'Email o contraseña incorrectos'
            });
            console.log('❌ Login fallido para:', loginData.email);
          }
        } catch (error) {
          console.error('❌ Error en login JWT:', error);
          observer.next({
            success: false,
            message: 'Error interno del servidor'
          });
        }
        
        observer.complete();
      }, 1500); // Simular delay de red
    });
  }

  /**
   * Registrar nuevo usuario con JWT
   */
  register(registerData: RegisterData): Observable<AuthResponse> {
    console.log('📝 Registrando nuevo usuario JWT:', registerData.email);
    
    return new Observable<AuthResponse>(observer => {
      setTimeout(async () => {
        try {
          // Validaciones
          if (registerData.password !== registerData.confirmPassword) {
            observer.next({
              success: false,
              message: 'Las contraseñas no coinciden'
            });
            observer.complete();
            return;
          }
          
          // Validar fortaleza de contraseña
          const passwordValidation = this.validatePasswordStrength(registerData.password);
          if (!passwordValidation.isValid) {
            observer.next({
              success: false,
              message: passwordValidation.errors.join(', ')
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
            ultimoAcceso: new Date(),
            activo: true,
            rol: UserRole.USER, // Por defecto los nuevos usuarios son USER
            preferencias: {
              tema: 'auto',
              notificaciones: true,
              idioma: 'es'
            }
          };
          
          // Agregar a la lista mock
          this.mockUsers.push(newUser);
          
          // Generar tokens JWT
          const accessToken = this.jwtService.generateMockToken(
            newUser.id, 
            newUser.email, 
            newUser.nombre, 
            newUser.rol
          );
          
          const refreshToken = this.generateRefreshToken();
          
          // Guardar tokens de forma segura
          await this.jwtService.saveAccessToken(accessToken);
          await this.jwtService.saveRefreshToken(refreshToken);
          
          // Actualizar estado
          this.currentUserSubject.next(newUser);
          this.isAuthenticatedSubject.next(true);
          
          observer.next({
            success: true,
            message: `¡Registro exitoso! Bienvenido ${newUser.nombre}`,
            user: newUser,
            accessToken,
            refreshToken,
            expiresIn: 24 * 60 * 60 // 24 horas en segundos
          });
          
          console.log('✅ Registro JWT exitoso para:', newUser.email);
        } catch (error) {
          console.error('❌ Error en registro JWT:', error);
          observer.next({
            success: false,
            message: 'Error interno del servidor'
          });
        }
        
        observer.complete();
      }, 2000); // Simular delay de red más largo para registro
    });
  }

  /**
   * Cerrar sesión con JWT
   */
  async logout(): Promise<void> {
    console.log('🚺 Cerrando sesión JWT...');
    await this.clearSession();
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
   * Limpiar sesión JWT
   */
  private async clearSession(): Promise<void> {
    try {
      // Limpiar tokens JWT
      await this.jwtService.clearTokens();
      
      // Limpiar estado local
      this.currentUserSubject.next(null);
      this.isAuthenticatedSubject.next(false);
      
      console.log('🗑️ Sesión JWT limpiada');
    } catch (error) {
      console.error('❌ Error limpiando sesión:', error);
    }
  }

  /**
   * Validar contraseña simple (compatible con legacy)
   */
  private validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * Validar fortaleza de la contraseña
   */
  private validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Debe incluir al menos una letra mayúscula');
    if (!/[a-z]/.test(password)) errors.push('Debe incluir al menos una letra minúscula');
    if (!/[0-9]/.test(password)) errors.push('Debe incluir al menos un número');
    if (!/[!@#$%^&*(),.?":{}|<>\[\]\\/;'-_+=]/.test(password)) errors.push('Debe incluir al menos un símbolo');
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Generar refresh token (mock)
   */
  private generateRefreshToken(): string {
    const random = Math.random().toString(36).substring(2);
    const timestamp = Date.now().toString(36);
    return `rt_${timestamp}_${random}`;
  }

  /**
   * Método añadido para compatibilidad con refresh tokens
   */
  async refreshAccessToken(): Promise<AuthResponse> {
    try {
      const refreshToken = await this.jwtService.getRefreshToken();
      
      if (!refreshToken) {
        await this.clearSession();
        return {
          success: false,
          message: 'No se encontró refresh token'
        };
      }
      
      // En un escenario real, aquí se haría una petición al servidor
      // Por ahora simulamos la renovación con el usuario actual
      const currentUser = this.getCurrentUser();
      
      if (currentUser) {
        const newAccessToken = this.jwtService.generateMockToken(
          currentUser.id,
          currentUser.email,
          currentUser.nombre,
          currentUser.rol
        );
        
        await this.jwtService.saveAccessToken(newAccessToken);
        
        console.log('🔄 Access token renovado exitosamente');
        return {
          success: true,
          message: 'Token renovado',
          user: currentUser,
          accessToken: newAccessToken,
          expiresIn: 24 * 60 * 60
        };
      }
      
      await this.clearSession();
      return {
        success: false,
        message: 'Usuario no encontrado para renovación'
      };
    } catch (error) {
      console.error('❌ Error renovando access token:', error);
      await this.clearSession();
      return {
        success: false,
        message: 'Error renovando token'
      };
    }
  }
}
