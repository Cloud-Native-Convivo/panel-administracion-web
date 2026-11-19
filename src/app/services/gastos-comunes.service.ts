import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { JobEspacio, Respuesta202 } from '../models/espacio.model';
import { esperarJob } from '../shared/esperar-job';
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
 * El Bearer token lo adjunta `MsalInterceptor` (protectedResourceMap en
 * auth/msalConfig.ts, sobre `environment.apiUrl`). La identidad (usuario y
 * roles) la deriva el BFF del JWT validado; el panel no la envía.
 */
@Injectable({ providedIn: 'root' })
export class GastosComunesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.bffBaseUrl}/gastos/api/v1/gastos-comunes`;

  /** Lista paginada. Admin/comité ven todo; propietario/residente, solo su unidad (filtrado por el microservicio). */
  listar(condominioId: string, page = 0, size = 20): Observable<PaginaSpring<GastoComun>> {
    const params = new HttpParams().set('condominioId', condominioId).set('page', page).set('size', size);
    return this.http.get<PaginaSpring<GastoComun>>(this.base, { params });
  }

  /** Lista filtrada por unidad. 403 si la unidad no es la propia y quien pregunta no es admin/comité. */
  listarPorUnidad(
    unidadId: string,
    condominioId: string,
    page = 0,
    size = 20,
  ): Observable<PaginaSpring<GastoComun>> {
    const params = new HttpParams().set('condominioId', condominioId).set('page', page).set('size', size);
    return this.http.get<PaginaSpring<GastoComun>>(
      `${this.base}/unidad/${encodeURIComponent(unidadId)}`,
      {
        params,
      },
    );
  }

  obtener(id: number, condominioId: string): Observable<GastoComun> {
    const params = new HttpParams().set('condominioId', condominioId);
    return this.http.get<GastoComun>(`${this.base}/${id}`, { params });
  }

  /** Alta manual de un cobro/cuota. Solo administrador/comité (el microservicio lo exige igual con @PreAuthorize). */
  crear(request: NuevoGastoComunRequest): Observable<Respuesta202> {
    return this.http.post<Respuesta202>(this.base, request);
  }

  /**
   * Edita concepto/monto/vencimiento. `unidadId`/`condominioId` van en el
   * body porque el DTO del microservicio los exige (@NotBlank), pero el
   * backend los ignora al actualizar: no permite reasignar unidad ni
   * condominio desde acá.
   */
  actualizar(
    id: number,
    unidadId: string,
    condominioId: string,
    cambios: ActualizarGastoComunRequest,
  ): Observable<Respuesta202> {
    const params = new HttpParams().set('condominioId', condominioId);
    return this.http.put<Respuesta202>(
      `${this.base}/${id}`,
      { unidadId, condominioId, ...cambios },
      { params },
    );
  }

  /** Borrado lógico (anula el gasto). No permitido si ya está PAGADO. */
  eliminar(id: number, condominioId: string): Observable<Respuesta202> {
    const params = new HttpParams().set('condominioId', condominioId);
    return this.http.delete<Respuesta202>(`${this.base}/${id}`, { params });
  }

  /** Registra un abono/pago sobre un gasto común existente. */
  registrarPago(id: number, condominioId: string, request: NuevoPagoRequest): Observable<Respuesta202> {
    const params = new HttpParams().set('condominioId', condominioId);
    return this.http.post<Respuesta202>(`${this.base}/${id}/pagos`, request, { params });
  }

  listarPagos(id: number, condominioId: string, page = 0, size = 20): Observable<PaginaSpring<Pago>> {
    const params = new HttpParams().set('condominioId', condominioId).set('page', page).set('size', size);
    return this.http.get<PaginaSpring<Pago>>(`${this.base}/${id}/pagos`, { params });
  }

  /**
   * Las mutaciones las acepta el bff con 202 y un ticket; este es su resultado.
   * El `error` y `resultado` que devuelve hoy ms-gastos-comunes no son legibles:
   * solo el `estado` es confiable.
   */
  esperarJob(ticketId: string): Observable<JobEspacio> {
    return esperarJob(() => this.http.get<JobEspacio>(`${environment.bffBaseUrl}/v1/gastos/jobs/${ticketId}`));
  }
}
