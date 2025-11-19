import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { StorageService } from '../services/storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notification = inject(NotificationService);
  const storage = inject(StorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';

      if (error.error instanceof ErrorEvent) {
        // Error del cliente
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Error del servidor
        switch (error.status) {
          case 401:
            errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
            storage.clear();
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            notification.error(errorMessage);
            break;
          case 404:
            errorMessage = 'Recurso no encontrado.';
            notification.warning(errorMessage);
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflicto con los datos existentes.';
            notification.error(errorMessage);
            break;
          case 500:
            errorMessage = 'Error del servidor. Intenta nuevamente más tarde.';
            notification.error(errorMessage);
            break;
        }
      }


      return throwError(() => error);
    })
  );
};
