import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Reserva } from '../models/reserva.model';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiEspaciosUrl || 'http://localhost:8082/api/v1'}/reservas`;

  listar(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.baseUrl}/`);
  }

  confirmarPago(id: number): Observable<Reserva> {
    return this.http.post<Reserva>(`${this.baseUrl}/${id}/confirmar-pago`, {});
  }
}
