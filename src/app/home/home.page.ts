import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ActionSheetController } from '@ionic/angular';
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: any = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    public router: Router,
    private actionSheetController: ActionSheetController
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
   * Navegar a productos
   */
  goToProducts() {
    console.log('Navegando a productos...');
    this.router.navigate(['/products']);
  }
  
  goToCategory(category: string) {
    console.log('Navegando a categoría:', category);
    this.router.navigate(['/products'], { queryParams: { category } });
  }

  /**
   * Mostrar menú de usuario
   */
  async showUserMenu() {
    const actionSheet = await this.actionSheetController.create({
      header: `Hola, ${this.currentUser?.nombre || 'Usuario'}`,
      buttons: [
        {
          text: 'Ver Perfil',
          icon: 'person-outline',
          handler: () => {
            console.log('👤 Navegando a perfil...');
            // this.router.navigate(['/profile']);
          }
        },
        {
          text: 'Mis Pedidos',
          icon: 'receipt-outline',
          handler: () => {
            console.log('📦 Navegando a pedidos...');
            // this.router.navigate(['/orders']);
          }
        },
        {
          text: 'Configuración',
          icon: 'settings-outline',
          handler: () => {
            console.log('⚙️ Navegando a configuración...');
            // this.router.navigate(['/settings']);
          }
        },
        {
          text: 'Cerrar Sesión',
          icon: 'log-out-outline',
          role: 'destructive',
          handler: () => {
            this.logout();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }
}
