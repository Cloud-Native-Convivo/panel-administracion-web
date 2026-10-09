import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Condominio } from '../models/condominio.model';
import { catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CondominiosService {
  private apiUrl = `${environment.bffBaseUrl}/condominios`;

  public condominios = signal<Condominio[]>([]);
  public condominioActivo = signal<Condominio | null>(null);
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  public loadCondominios(): void {
    this.loading.set(true);
    this.http
      .get<Condominio[]>(this.apiUrl)
      .pipe(
        catchError((err) => {
          console.error('Error cargando condominios', err);
          return of([]);
        }),
      )
      .subscribe((data) => {
        this.condominios.set(data);
        this.loading.set(false);
      });
  }

  public seleccionar(condominio: Condominio): void {
    this.condominioActivo.set(condominio);
  }

  public crearCondominio(data: Partial<Condominio>): void {
    this.loading.set(true);
    this.http
      .post<Condominio>(this.apiUrl, data)
      .pipe(
        catchError((err) => {
          console.error('Error creando condominio', err);
          return of(null);
        }),
      )
      .subscribe((nuevo) => {
        if (nuevo) {
          this.condominios.update((list) => [...list, nuevo]);
          this.seleccionar(nuevo);
        }
        this.loading.set(false);
      });
  }
}
