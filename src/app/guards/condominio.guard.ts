import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { map } from 'rxjs';
import { rolesDeCuenta } from '../../auth/roles';
import { CondominiosService } from '../services/condominios.service';

/**
 * Exige un condominio seleccionado antes de entrar a pantallas que dependen
 * de él (espacios, gastos comunes, etc.).
 *
 * Si no hay ninguno activo, espera a que cargue la lista (que restaura la
 * selección guardada en la sesión). Si sigue sin haber uno:
 * - admin: va a /condominios para crear o elegir uno.
 * - otros roles: van a /sin-condominio. No pueden entrar a /condominios (solo
 *   admin), y mandarlos ahí los devolvía a /dashboard en un bucle.
 */
export const condominioGuard: CanActivateFn = () => {
  const condominios = inject(CondominiosService);
  const router = inject(Router);
  const msal = inject(MsalService);

  if (condominios.condominioActivo()) {
    return true;
  }

  const cuenta = msal.instance.getActiveAccount() ?? msal.instance.getAllAccounts()[0] ?? null;
  const esAdmin = rolesDeCuenta(cuenta).includes('administrador');
  const sinSeleccion = router.createUrlTree([esAdmin ? '/condominios' : '/sin-condominio']);

  if (condominios.condominios().length > 0) {
    return sinSeleccion;
  }

  return condominios
    .cargarCondominios()
    .pipe(map(() => (condominios.condominioActivo() ? true : sinSeleccion)));
};
