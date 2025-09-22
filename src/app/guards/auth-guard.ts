import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Verifica si el usuario está autenticado antes de permitir acceso
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  console.log('🛡️ Guard de autenticación verificando acceso a:', state.url);
  
  if (authService.isAuthenticated()) {
    console.log('✅ Usuario autenticado, permitiendo acceso');
    return true;
  } else {
    console.log('❌ Usuario no autenticado, redirigiendo al login');
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};
