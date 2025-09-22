import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para páginas que solo deben ser accesibles por usuarios NO autenticados
 * Si el usuario ya está autenticado, lo redirige al home
 * Útil para páginas de login y registro
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('🚪 Guest Guard verificando acceso a:', state.url);
  
  if (authService.isAuthenticated()) {
    console.log('✅ Usuario ya autenticado, redirigiendo al home');
    router.navigate(['/home']);
    return false;
  } else {
    console.log('👤 Usuario no autenticado, permitiendo acceso a', state.url);
    return true;
  }
};