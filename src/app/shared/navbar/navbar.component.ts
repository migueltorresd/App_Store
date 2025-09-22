import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Input() title: string = 'TechStore';
  @Input() showBackButton: boolean = false;
  @Input() backUrl: string = '/';
  
  currentUser: any = null;
  isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    // Suscribirse a cambios de autenticación
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  /**
   * Navegar al carrito
   */
  goToCart() {
    this.router.navigate(['/cart']);
  }

  /**
   * Navegar a productos
   */
  goToProducts() {
    this.router.navigate(['/products']);
  }

  /**
   * Navegar al login
   */
  goToLogin() {
    this.router.navigate(['/login']);
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

  /**
   * Cerrar sesión
   */
  async logout() {
    await this.authService.logout();
    console.log('🚪 Sesión cerrada desde navbar');
  }

  /**
   * Navegar hacia atrás
   */
  goBack() {
    if (this.backUrl) {
      this.router.navigate([this.backUrl]);
    } else {
      window.history.back();
    }
  }
}
