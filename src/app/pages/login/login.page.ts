import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, LoadingController, IonicModule } from '@ionic/angular';
import { AuthService, LoginData } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  emailError = '';
  passwordError = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    // Verificar si ya está autenticado
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    });
    
    console.log('🔐 Página de Login inicializada');
  }

  /**
   * Inicializar formulario reactivo
   */
  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // Suscribirse a cambios para limpiar errores
    this.loginForm.get('email')?.valueChanges.subscribe(() => {
      this.emailError = '';
    });

    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.passwordError = '';
    });
  }

  /**
   * Alternar visibilidad de contraseña
   */
  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Manejar envío del formulario
   */
  async onLogin(): Promise<void> {
    if (this.loginForm.valid && !this.isLoading) {
      this.clearErrors();
      this.isLoading = true;

      const loginData: LoginData = {
        email: this.loginForm.get('email')?.value,
        password: this.loginForm.get('password')?.value
      };

      try {
        this.authService.login(loginData).subscribe({
          next: async (response) => {
            this.isLoading = false;
            
            if (response.success) {
              await this.showToast(response.message, 'success');
              console.log('✅ Login exitoso, redirigiendo...');
              this.router.navigate(['/home'], { replaceUrl: true });
            } else {
              await this.showToast(response.message, 'danger');
              this.handleLoginError(response.message);
            }
          },
          error: async (error) => {
            this.isLoading = false;
            console.error('❌ Error en login:', error);
            await this.showToast('Error de conexión. Intenta de nuevo.', 'danger');
          }
        });
      } catch (error) {
        this.isLoading = false;
        console.error('❌ Error inesperado:', error);
        await this.showToast('Error inesperado. Intenta de nuevo.', 'danger');
      }
    } else {
      this.validateForm();
    }
  }

  /**
   * Validar formulario y mostrar errores
   */
  private validateForm(): void {
    const emailControl = this.loginForm.get('email');
    const passwordControl = this.loginForm.get('password');

    if (emailControl?.invalid) {
      if (emailControl.errors?.['required']) {
        this.emailError = 'El correo electrónico es requerido';
      } else if (emailControl.errors?.['email']) {
        this.emailError = 'Ingresa un correo electrónico válido';
      }
    }

    if (passwordControl?.invalid) {
      if (passwordControl.errors?.['required']) {
        this.passwordError = 'La contraseña es requerida';
      } else if (passwordControl.errors?.['minlength']) {
        this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
      }
    }
  }

  /**
   * Manejar errores de login
   */
  private handleLoginError(message: string): void {
    if (message.toLowerCase().includes('email')) {
      this.emailError = message;
    } else if (message.toLowerCase().includes('contraseña')) {
      this.passwordError = message;
    }
  }

  /**
   * Limpiar errores
   */
  private clearErrors(): void {
    this.emailError = '';
    this.passwordError = '';
  }

  /**
   * Navegar a la página de registro
   */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  /**
   * Mostrar toast
   */
  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color,
      buttons: [
        {
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}