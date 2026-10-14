import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CondominiosService } from '../services/condominios.service';

/**
 * Exige un condominio seleccionado antes de entrar a pantallas que dependen
 * de él (espacios, gastos comunes, etc.). Si no hay ninguno cargado todavía,
 * dispara la carga; si tras cargar no hay condominio activo, redirige a
 * /condominios para que el admin cree uno o elija de la lista.
 */
export const condominioGuard: CanActivateFn = () => {
  const condominiosService = inject(CondominiosService);
  const router = inject(Router);

  if (condominiosService.condominios().length === 0) {
    condominiosService.loadCondominios();
  }

  if (condominiosService.condominioActivo()) {
    return true;
  }

  return router.createUrlTree(['/condominios']);
};
