import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CrearUnidadDto, Unidad } from '../models/unidad.model';

@Injectable({ providedIn: 'root' })
export class UnidadesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.bffBaseUrl}/condominios`;

  // Barra final en listar/crear: la ruta de ms-condominios es ".../unidades/".
  listar(condominioId: number, incluirInactivas = false): Observable<Unidad[]> {
    const params = new HttpParams().set('incluir_inactivas', incluirInactivas);
    return this.http.get<Unidad[]>(`${this.apiUrl}/${condominioId}/unidades/`, { params });
  }

  crear(condominioId: number, dto: CrearUnidadDto): Observable<Unidad> {
    return this.http.post<Unidad>(`${this.apiUrl}/${condominioId}/unidades/`, dto);
  }

  cambiarActiva(condominioId: number, id: number, activa: boolean): Observable<Unidad> {
    return this.http.put<Unidad>(`${this.apiUrl}/${condominioId}/unidades/${id}`, { activa });
  }
}
