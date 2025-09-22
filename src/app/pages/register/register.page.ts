import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, AbstractControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { AuthService, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class RegisterPage implements OnInit {
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private authService: AuthService
  ) {
    this.initializeForm();
  }

  ngOnInit() {}

  /**
   * Inicializar el formulario de registro con validaciones
   */
  private initializeForm() {
    this.registerForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$') // Solo letras y espacios
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern('^(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]+$') // Al menos una mayúscula y un número
        ]
      ],
      confirmPassword: [
        '',
        [Validators.required]
      ]
    }, {
      validators: this.passwordMatchValidator // Validador personalizado
    });
  }

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (!password || !confirmPassword) {
      return null;
    }
    
    return password.value === confirmPassword.value ? null : { mismatch: true };
  }

  /**
   * Alternar visibilidad de la contraseña
   */
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**
   * Alternar visibilidad de la confirmación de contraseña
   */
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Procesar el registro del usuario
   */
  async onRegister() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched();
      await this.showErrorAlert('Por favor, corrige los errores en el formulario.');
      return;
    }

    this.isLoading = true;

    try {
      const formValue = this.registerForm.value;
      const registerData: RegisterData = {
        name: formValue.name.trim(),
        email: formValue.email.toLowerCase().trim(),
        password: formValue.password
      };

      // Mostrar loading
      const loading = await this.loadingController.create({
        message: 'Creando cuenta...',
        spinner: 'circles'
      });
      await loading.present();

      // Intentar registro
      const result = await this.authService.register(registerData);
      
      await loading.dismiss();

      if (result.success) {
        await this.showSuccessToast('Cuenta creada exitosamente. ¡Bienvenido!');
        // Redireccionar al home o dashboard
        this.router.navigate(['/home'], { replaceUrl: true });
      } else {
        throw new Error(result.error || 'Error al crear la cuenta');
      }

    } catch (error: any) {
      await this.loadingController.dismiss();
      console.error('Error en registro:', error);
      
      let errorMessage = 'Error al crear la cuenta. Intenta nuevamente.';
      
      // Manejar errores específicos
      if (error.message?.includes('email already exists') || 
          error.message?.includes('ya existe')) {
        errorMessage = 'Este email ya está registrado. Intenta con otro email.';
      } else if (error.message?.includes('weak password') ||
                error.message?.includes('contraseña débil')) {
        errorMessage = 'La contraseña es muy débil. Usa al menos 6 caracteres con mayúsculas y números.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      await this.showErrorAlert(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Registro con Google
   */
  async registerWithGoogle() {
    try {
      const loading = await this.loadingController.create({
        message: 'Conectando con Google...',
        spinner: 'circles'
      });
      await loading.present();

      const result = await this.authService.signInWithGoogle();
      await loading.dismiss();

      if (result.success) {
        await this.showSuccessToast('Registro exitoso con Google');
        this.router.navigate(['/home'], { replaceUrl: true });
      } else {
        throw new Error(result.error || 'Error al registrar con Google');
      }
    } catch (error: any) {
      await this.loadingController.dismiss();
      console.error('Error registro Google:', error);
      await this.showErrorAlert('Error al registrar con Google. Intenta nuevamente.');
    }
  }

  /**
   * Registro con Facebook
   */
  async registerWithFacebook() {
    try {
      const loading = await this.loadingController.create({
        message: 'Conectando con Facebook...',
        spinner: 'circles'
      });
      await loading.present();

      const result = await this.authService.signInWithFacebook();
      await loading.dismiss();

      if (result.success) {
        await this.showSuccessToast('Registro exitoso con Facebook');
        this.router.navigate(['/home'], { replaceUrl: true });
      } else {
        throw new Error(result.error || 'Error al registrar con Facebook');
      }
    } catch (error: any) {
      await this.loadingController.dismiss();
      console.error('Error registro Facebook:', error);
      await this.showErrorAlert('Error al registrar con Facebook. Intenta nuevamente.');
    }
  }

  /**
   * Navegar a la página de login
   */
  goToLogin() {
    this.router.navigate(['/login'], { replaceUrl: true });
  }


  /**
   * Marcar todos los campos del formulario como tocados para mostrar errores
   */
  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Mostrar toast de éxito
   */
  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  /**
   * Mostrar alerta de error
   */
  private async showErrorAlert(message: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message,
      buttons: ['OK'],
      cssClass: 'error-alert'
    });
    await alert.present();
  }
}