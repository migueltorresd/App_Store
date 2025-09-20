import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { User } from '../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('👤 Usuario actual:', user?.nombre || 'No autenticado');
    });

    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
      console.log('🔒 Estado de autenticación:', isAuth ? 'Autenticado' : 'No autenticado');
    });
  }

  /**
   * Simular acción de login rápido para demo
   */
  quickLogin() {
    const demoLoginData = {
      email: 'admin@electrostore.com',
      password: '123456'
    };

    this.authService.login(demoLoginData).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('✅ Login rápido exitoso');
        }
      },
      error: (error) => {
        console.error('❌ Error en login rápido:', error);
      }
    });
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this.authService.logout();
    console.log('🚪 Sesión cerrada');
  }

  /**
   * Navegar a sección que requiere autenticación (para probar guard)
   */
  goToProtectedSection() {
    // Esto activará el guard de autenticación
    this.router.navigate(['/productos']); // Crearemos esta ruta protegida después
  }
}
