import { Component, inject } from '@angular/core';
import { MsalService } from '@azure/msal-angular';

/**
 * Destino del roleGuard cuando la cuenta no tiene un rol del panel.
 * No lleva roleGuard: es lo que evita el bucle de redirecciones.
 */
@Component({
  selector: 'app-sin-acceso',
  template: `
    <section class="mx-auto max-w-xl p-4 sm:p-6 lg:p-8" aria-labelledby="sin-acceso-titulo">
      <h1 id="sin-acceso-titulo" class="text-lg sm:text-xl lg:text-2xl font-semibold">
        Sin acceso al panel
      </h1>
      <p class="mt-3 text-sm sm:text-base">
        Tu cuenta no tiene un rol asignado para usar este panel. Pide a un administrador que te
        asigne uno.
      </p>
      <button
        type="button"
        class="mt-6 min-h-11 rounded-lg bg-primary px-4 text-sm font-medium text-white"
        (click)="cerrarSesion()"
      >
        Cerrar sesión
      </button>
    </section>
  `,
})
export class SinAcceso {
  private readonly msal = inject(MsalService);

  protected cerrarSesion(): void {
    this.msal.logoutRedirect();
  }
}
