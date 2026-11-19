import {
  Observable,
  catchError,
  exhaustMap,
  filter,
  of,
  take,
  throwError,
  timeout,
  timer,
} from 'rxjs';
import type { EstadoJob } from '../models/espacio.model';

/** Cada cuánto se consulta el estado de una solicitud aceptada con 202. */
export const INTERVALO_SONDEO_MS = 2000;
/** Tiempo máximo de espera del resultado antes de rendirse. */
export const TIEMPO_MAXIMO_ESPERA_MS = 30000;

const ESTADOS_FINALES: EstadoJob[] = ['COMPLETADO', 'FALLIDO'];

/**
 * Consulta el job cada INTERVALO_SONDEO_MS hasta que termina (COMPLETADO o
 * FALLIDO) y emite ese job. Falla con TimeoutError pasados
 * TIEMPO_MAXIMO_ESPERA_MS. Un 404 se tolera: el consumidor puede tardar en
 * registrar el job. Si una consulta sigue en curso, se salta el turno.
 */
export function esperarJob<T extends { estado: EstadoJob }>(
  consultar: () => Observable<T>,
): Observable<T> {
  return timer(INTERVALO_SONDEO_MS, INTERVALO_SONDEO_MS).pipe(
    exhaustMap(() =>
      consultar().pipe(
        catchError((err) => (err?.status === 404 ? of(null) : throwError(() => err))),
      ),
    ),
    filter((job): job is T => job !== null && ESTADOS_FINALES.includes(job.estado)),
    take(1),
    timeout({ first: TIEMPO_MAXIMO_ESPERA_MS }),
  );
}
