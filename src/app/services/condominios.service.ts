import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Condominio } from '../models/condominio.model';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SolicitudAsignacion {
  id: number;
  usuario_sub: string;
  condominio_id: number;
  unidad: string;
  estado: string;
}

const ACTIVO_KEY = 'convivo.condominioActivoId';

@Injectable({ providedIn: 'root' })
export class CondominiosService {
  private apiUrl = `${environment.bffBaseUrl}/condominios`;

  public condominios = signal<Condominio[]>([]);
  public condominioActivo = signal<Condominio | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  public listarSolicitudes(): Observable<SolicitudAsignacion[]> {
    return this.http.get<SolicitudAsignacion[]>(`${this.apiUrl}/solicitudes`);
  }

  public aprobarSolicitud(id: number): Observable<SolicitudAsignacion> {
    return this.http.post<SolicitudAsignacion>(`${this.apiUrl}/solicitudes/${id}/aprobar`, {});
  }

  public loadCondominios(): void {
    this.cargarCondominios().subscribe();
  }

  /** Carga la lista y restaura el condominio activo guardado en la sesión, si sigue existiendo. */
  public cargarCondominios(): Observable<Condominio[]> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.get<Condominio[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error cargando condominios', err);
        this.error.set(this.mensajeError(err));
        return of([] as Condominio[]);
      }),
      tap((data) => {
        this.condominios.set(data);
        this.loading.set(false);
        this.restaurarActivo(data);
      }),
    );
  }

  public seleccionar(condominio: Condominio | null): void {
    this.condominioActivo.set(condominio);
    this.guardarActivoId(condominio?.id ?? null);
  }

  private restaurarActivo(lista: Condominio[]): void {
    if (this.condominioActivo()) return;
    const id = this.leerActivoId();
    const guardado = id === null ? undefined : lista.find((c) => c.id === id);
    if (guardado) this.condominioActivo.set(guardado);
  }

  private leerActivoId(): number | null {
    try {
      const valor = sessionStorage.getItem(ACTIVO_KEY);
      return valor === null ? null : Number(valor);
    } catch {
      return null;
    }
  }

  private guardarActivoId(id: number | null): void {
    try {
      if (id === null) sessionStorage.removeItem(ACTIVO_KEY);
      else sessionStorage.setItem(ACTIVO_KEY, String(id));
    } catch {
      // sessionStorage no disponible (modo privado o bloqueado): la selección queda solo en memoria.
    }
  }

  /** Devuelve el condominio creado, o null si falló (ver `error()` para el motivo). */
  public crearCondominio(data: Partial<Condominio>): Observable<Condominio | null> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.post<Condominio>(this.apiUrl, data).pipe(
      tap((nuevo) => {
        this.condominios.update((list) => [...list, nuevo]);
        this.seleccionar(nuevo);
        this.loading.set(false);
      }),
      catchError((err) => {
        console.error('Error creando condominio', err);
        this.error.set(this.mensajeError(err));
        this.loading.set(false);
        return of(null);
      }),
    );
  }

  /** Devuelve el condominio actualizado, o null si falló (ver `error()` para el motivo). */
  public actualizarCondominio(
    id: number,
    cambios: Partial<Condominio>,
  ): Observable<Condominio | null> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.put<Condominio>(`${this.apiUrl}/${id}`, cambios).pipe(
      tap((actualizado) => {
        this.condominios.update((list) =>
          list.map((c) => (c.id === actualizado.id ? actualizado : c)),
        );
        if (this.condominioActivo()?.id === actualizado.id) {
          this.condominioActivo.set(actualizado);
        }
        this.loading.set(false);
      }),
      catchError((err) => {
        console.error('Error actualizando condominio', err);
        this.error.set(this.mensajeError(err));
        this.loading.set(false);
        return of(null);
      }),
    );
  }

  /** Devuelve true si se eliminó, false si falló (ver `error()` para el motivo). */
  public eliminarCondominio(id: number): Observable<boolean> {
    this.loading.set(true);
    this.error.set(null);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      map(() => true),
      tap(() => {
        this.condominios.update((list) => list.filter((c) => c.id !== id));
        if (this.condominioActivo()?.id === id) {
          this.seleccionar(null);
        }
        this.loading.set(false);
      }),
      catchError((err) => {
        console.error('Error eliminando condominio', err);
        this.error.set(this.mensajeError(err));
        this.loading.set(false);
        return of(false);
      }),
    );
  }

  private mensajeError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    const detalle = (err as { error?: { detail?: string; message?: string } })?.error;
    if (status === 0) {
      return 'No se pudo conectar con el BFF. ¿Está corriendo en bffBaseUrl (por defecto http://localhost:3000)?';
    }
    if (status === 401) {
      return 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.';
    }
    if (status === 403) {
      return (
        detalle?.detail ??
        detalle?.message ??
        'No tienes permiso para esta acción (requiere rol ADMIN).'
      );
    }
    if (status === 404) {
      return 'El condominio no existe o fue eliminado.';
    }
    if (status === 422) {
      return detalle?.detail ?? 'Datos inválidos: revisa los campos del formulario.';
    }
    if (status === 502) {
      return 'El microservicio de Condominios no respondió (¿está corriendo en el puerto 8084?).';
    }
    return detalle?.detail ?? detalle?.message ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
