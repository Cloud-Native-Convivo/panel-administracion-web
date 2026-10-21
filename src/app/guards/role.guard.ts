import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { rolesDeCuenta, RolConvivo } from '../../auth/roles';

/**
 * Guard de autorización basado en roles (RBAC).
 *
 * Principio Fail-Closed (security-audit / OWASP A01):
 * - Si no hay sesión activa -> redirige a /login.
 * - Si la ruta define data.roles y el usuario no posee ninguno -> redirige a /dashboard.
 * - Si la ruta no define roles requeridos -> permite acceso.
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const msal = inject(MsalService);
  const router = inject(Router);

  const cuenta = msal.instance.getActiveAccount() ?? msal.instance.getAllAccounts()[0] ?? null;
  if (!cuenta) {
    return router.createUrlTree(['/login']);
  }

  const expectedRoles = (route.data?.['roles'] as RolConvivo[]) ?? [];
  if (expectedRoles.length === 0) {
    return true;
  }

  const userRoles = rolesDeCuenta(cuenta);
  const hasRole = userRoles.some((r) => expectedRoles.includes(r));

  return hasRole ? true : router.createUrlTree(['/dashboard']);
};
