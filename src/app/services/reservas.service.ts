import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reserva } from '../models/reserva.model';
import { Respuesta202 } from '../models/espacio.model';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiEspaciosUrl || 'http://localhost:8082/api/v1'}/reservas`;

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/`);
  }

  /** El bff acepta la cancelación con 202 y un ticket: la reserva aún no cambió. */
  cancelar(id: number): Observable<Respuesta202> {
    return this.http.delete<Respuesta202>(`${this.baseUrl}/${id}`);
  }
}
