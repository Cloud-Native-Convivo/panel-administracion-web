import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, exhaustMap, filter, map, of, take, throwError, timeout, timer } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Espacio,
  CrearEspacioDto,
  ActualizarEspacioDto,
  EstadoJob,
  JobEspacio,
  Respuesta202,
} from '../models/espacio.model';

/** Cada cuánto se consulta el estado de una solicitud aceptada con 202. */
export const INTERVALO_SONDEO_MS = 2000;
/** Tiempo máximo de espera del resultado antes de rendirse. */
export const TIEMPO_MAXIMO_ESPERA_MS = 30000;

const ESTADOS_FINALES: EstadoJob[] = ['COMPLETADO', 'FALLIDO'];

@Injectable({
  providedIn: 'root',
})
export class EspaciosService {
  private readonly http = inject(HttpClient);
  private readonly rootUrl = environment.apiEspaciosUrl || 'http://localhost:8082/api/v1';
  private readonly baseUrl = `${this.rootUrl}/espacios`;

  private readonly GALERIA_TEMATICA: { patron: RegExp; url: string }[] = [
    {
      patron: /piscin|alberca|pool/i,
      url: 'https://images.unsplash.com/photo-1613152184920-bc1c4ab7fd1d?w=600&h=380&fit=crop&auto=format',
    },
    {
      patron: /quinch|asador|parrill|barbecue|bbq/i,
      url: 'https://images.unsplash.com/photo-1560448204-444f743ef6e7?w=600&h=380&fit=crop&auto=format',
    },
    {
      patron: /gimnas|gym|fitness|musculac/i,
      url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=380&fit=crop&auto=format',
    },
    {
      patron: /sal[oó]n|eventos|multiuso|comunitari/i,
      url: 'https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=600&h=380&fit=crop&auto=format',
    },
    {
      patron: /cancha|p[aá]del|tenis|futbol|sport/i,
      url: 'https://images.unsplash.com/photo-1764254811090-af4a43594a03?w=600&h=380&fit=crop&auto=format',
    },
  ];

  private readonly IMAGEN_DEFECTO =
    'https://images.unsplash.com/photo-1560448204-444f743ef6e7?w=600&h=380&fit=crop&auto=format';

  obtenerImagenTematica(nombre: string): string {
    const item = this.GALERIA_TEMATICA.find((g) => g.patron.test(nombre));
    return item ? item.url : this.IMAGEN_DEFECTO;
  }

  private enriquecerConImagen(espacio: Espacio): Espacio {
    return {
      ...espacio,
      img: espacio.img || this.obtenerImagenTematica(espacio.nombre),
    };
  }

  listar(condominioId: number): Observable<Espacio[]> {
    const params = new HttpParams().set('condominio_id', condominioId);
    return this.http
      .get<Espacio[]>(`${this.baseUrl}`, { params })
      .pipe(map((espacios) => espacios.map((e) => this.enriquecerConImagen(e))));
  }

  obtenerPorId(id: number, condominioId: number): Observable<Espacio> {
    const params = new HttpParams().set('condominio_id', condominioId);
    return this.http
      .get<Espacio>(`${this.baseUrl}/${id}`, { params })
      .pipe(map((espacio) => this.enriquecerConImagen(espacio)));
  }

  /** El bff acepta la mutación con 202 y un ticket: no devuelve el espacio. */
  crear(dto: CrearEspacioDto): Observable<Respuesta202> {
    return this.http.post<Respuesta202>(`${this.baseUrl}`, dto);
  }

  actualizar(id: number, condominioId: number, dto: ActualizarEspacioDto): Observable<Respuesta202> {
    const params = new HttpParams().set('condominio_id', condominioId);
    return this.http.put<Respuesta202>(`${this.baseUrl}/${id}`, dto, { params });
  }

  eliminar(id: number, condominioId: number): Observable<Respuesta202> {
    const params = new HttpParams().set('condominio_id', condominioId);
    return this.http.delete<Respuesta202>(`${this.baseUrl}/${id}`, { params });
  }

  consultarJob(ticketId: string): Observable<JobEspacio> {
    return this.http.get<JobEspacio>(`${this.rootUrl}/jobs/${ticketId}`);
  }

  /**
   * Consulta el job cada INTERVALO_SONDEO_MS hasta que termina (COMPLETADO o
   * FALLIDO) y emite ese job. Falla con TimeoutError pasados
   * TIEMPO_MAXIMO_ESPERA_MS. Un 404 se tolera: el consumidor puede tardar en
   * registrar el job. Si una consulta sigue en curso, se salta el turno.
   */
  esperarJob(ticketId: string): Observable<JobEspacio> {
    return timer(INTERVALO_SONDEO_MS, INTERVALO_SONDEO_MS).pipe(
      exhaustMap(() =>
        this.consultarJob(ticketId).pipe(
          catchError((err) => (err?.status === 404 ? of(null) : throwError(() => err))),
        ),
      ),
      filter((job): job is JobEspacio => job !== null && ESTADOS_FINALES.includes(job.estado)),
      take(1),
      timeout({ first: TIEMPO_MAXIMO_ESPERA_MS }),
    );
  }
}
