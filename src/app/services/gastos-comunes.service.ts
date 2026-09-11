import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type {
  ActualizarGastoComunRequest,
  GastoComun,
  NuevoGastoComunRequest,
  NuevoPagoRequest,
  Pago,
  PaginaSpring,
} from '../models/gasto-comun.model';

/**
 * Cliente HTTP hacia el dominio Gastos Comunes, siempre a través del BFF
 * (nunca directo al microservicio).
 *
 * OJO con la URL: el proxy del BFF (`/api/gastos/*path`) le quita el
 * prefijo `/api/gastos` a lo que llega y reenvía el resto tal cual al
 * microservicio, que expone sus endpoints bajo `/api/v1/gastos-comunes`.
 * Por eso la URL de acá abajo repite `api` dos veces; no es un error de
 * tipeo, es cómo queda armado el proxy.
 *
 * `authInterceptor` adjunta el Bearer token automáticamente porque
 * `bffBaseUrl` está incluido en su chequeo `isApiUrl` (ver
 * app/interceptors/auth.interceptor.ts).
 */
@Injectable({ providedIn: 'root' })
export class GastosComunesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffBaseUrl}/gastos/api/v1/gastos-comunes`;

  /** Lista paginada. Admin/comité ven todo; propietario/residente, solo su unidad (filtrado por el microservicio). */
  listar(page = 0, size = 20): Observable<PaginaSpring<GastoComun>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginaSpring<GastoComun>>(this.base, { params });
  }

  /** Lista filtrada por unidad. 403 si la unidad no es la propia y quien pregunta no es admin/comité. */
  listarPorUnidad(unidadId: string, page = 0, size = 20): Observable<PaginaSpring<GastoComun>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginaSpring<GastoComun>>(`${this.base}/unidad/${encodeURIComponent(unidadId)}`, {
      params,
    });
  }

  obtener(id: number): Observable<GastoComun> {
    return this.http.get<GastoComun>(`${this.base}/${id}`);
  }

  /** Alta manual de un cobro/cuota. Solo administrador/comité (el microservicio lo exige igual con @PreAuthorize). */
  crear(request: NuevoGastoComunRequest): Observable<GastoComun> {
    return this.http.post<GastoComun>(this.base, request);
  }

  /**
   * Edita concepto/monto/vencimiento. `unidadId` va en el body porque el
   * DTO del microservicio lo exige (@NotBlank), pero el backend lo ignora
   * al actualizar: no permite reasignar la unidad desde acá.
   */
  actualizar(id: number, unidadId: string, cambios: ActualizarGastoComunRequest): Observable<GastoComun> {
    return this.http.put<GastoComun>(`${this.base}/${id}`, { unidadId, ...cambios });
  }

  /** Borrado lógico (anula el gasto). No permitido si ya está PAGADO. */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Registra un abono/pago sobre un gasto común existente. */
  registrarPago(id: number, request: NuevoPagoRequest): Observable<Pago> {
    return this.http.post<Pago>(`${this.base}/${id}/pagos`, request);
  }

  listarPagos(id: number, page = 0, size = 20): Observable<PaginaSpring<Pago>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<PaginaSpring<Pago>>(`${this.base}/${id}/pagos`, { params });
  }
}
