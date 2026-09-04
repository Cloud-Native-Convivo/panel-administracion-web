import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  // Punto central para futuras llamadas al backend (BFF/API Gateway).
  // Los métodos de negocio se agregarán cuando se definan los endpoints.
}
