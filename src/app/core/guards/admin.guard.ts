import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const notification = inject(NotificationService);

  const user = authService.currentUser();

  if (user?.role === 'ADMIN') {
    return true;
  }

  notification.error(
    'No tienes permisos para acceder a esta sección',
    'Acceso denegado'
  );
  router.navigate(['/dashboard/home']);
  return false;
};
