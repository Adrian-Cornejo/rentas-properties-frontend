// src/app/core/guards/plan-feature.guard.ts

import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot
} from '@angular/router';
import { PlanService } from '../services/plan.service';

/**
 * Guard para proteger rutas que requieren features específicas del plan
 *
 * Uso en routing:
 * {
 *   path: 'notifications',
 *   component: NotificationsComponent,
 *   canActivate: [planFeatureGuard],
 *   data: { feature: 'NOTIFICATIONS' }
 * }
 */
export const planFeatureGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const planService = inject(PlanService);
  const router = inject(Router);

  const requiredFeature = route.data['feature'] as string;

  if (!requiredFeature) {
    console.warn('[PlanFeatureGuard] No feature specified in route data');
    return true;
  }

  // Verificar si tiene la feature
  if (planService.hasFeature(requiredFeature)) {
    return true;
  }

  console.warn(
    `[PlanFeatureGuard] Feature "${requiredFeature}" not available in plan "${planService.getPlanCode()}"`
  );

  router.navigate(['/upgrade'], {
    queryParams: {
      feature: requiredFeature,
      plan: planService.getPlanCode()
    }
  });

  return false;
};

export const planLimitGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
) => {
  const planService = inject(PlanService);
  const router = inject(Router);

  const resourceType = route.data['resourceType'] as 'properties' | 'users';

  if (!resourceType) {
    console.warn('[PlanLimitGuard] No resourceType specified in route data');
    return true;
  }

  if (!planService.hasReachedLimit(resourceType)) {
    return true;
  }

  const usage = planService.getUsage(resourceType);

  console.warn(
    `[PlanLimitGuard] Limit reached for "${resourceType}": ${usage.current}/${usage.max}`
  );

  router.navigate(['/upgrade'], {
    queryParams: {
      reason: 'limit_reached',
      resource: resourceType,
      plan: planService.getPlanCode()
    }
  });

  return false;
};
