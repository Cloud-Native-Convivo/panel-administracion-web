import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Espacio, CrearEspacioDto, ActualizarEspacioDto } from '../models/espacio.model';

@Injectable({
  providedIn: 'root',
})
export class EspaciosService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiEspaciosUrl || 'http://localhost:8082/api/v1'}/espacios`;

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

  listar(): Observable<Espacio[]> {
    return this.http
      .get<Espacio[]>(`${this.baseUrl}/`)
      .pipe(map((espacios) => espacios.map((e) => this.enriquecerConImagen(e))));
  }

  obtenerPorId(id: number): Observable<Espacio> {
    return this.http
      .get<Espacio>(`${this.baseUrl}/${id}`)
      .pipe(map((espacio) => this.enriquecerConImagen(espacio)));
  }

  crear(dto: CrearEspacioDto): Observable<Espacio> {
    return this.http
      .post<Espacio>(`${this.baseUrl}/`, dto)
      .pipe(map((espacio) => this.enriquecerConImagen(espacio)));
  }

  actualizar(id: number, dto: ActualizarEspacioDto): Observable<Espacio> {
    return this.http
      .put<Espacio>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((espacio) => this.enriquecerConImagen(espacio)));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
