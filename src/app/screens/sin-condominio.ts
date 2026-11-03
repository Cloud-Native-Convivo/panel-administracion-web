import { Component } from '@angular/core';

/**
 * Destino de los roles que no son admin cuando no hay un condominio activo.
 * No lleva condominioGuard: es lo que evita el bucle de redirecciones.
 */
@Component({
  selector: 'app-sin-condominio',
  template: `
    <section class="mx-auto max-w-xl p-4 sm:p-6 lg:p-8" aria-labelledby="sin-condominio-titulo">
      <h1 id="sin-condominio-titulo" class="text-lg sm:text-xl lg:text-2xl font-semibold">
        Sin condominio asignado
      </h1>
      <p class="mt-3 text-sm sm:text-base">
        Tu cuenta no tiene un condominio activo. Pide a un administrador que te asigne uno para usar
        espacios, reservas y gastos comunes.
      </p>
    </section>
  `,
})
export class SinCondominio {}
