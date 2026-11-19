import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Respuesta202 } from '../models/espacio.model';
import { ReservasService } from './reservas.service';

const respuesta202: Respuesta202 = {
  ticket_id: 't1',
  estado: 'EN_COLA',
  status_url: '/api/v1/espacios-comunes/jobs/t1',
  creado_en: '2026-11-16T12:00:00.000Z',
};

describe('ReservasService: cancelar', () => {
  let service: ReservasService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReservasService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('cancelar hace DELETE a /reservas/{id} sin query y devuelve el 202 tal cual', () => {
    let recibido: unknown;
    service.cancelar(101).subscribe((r) => (recibido = r));

    const req = http.expectOne((r) => r.method === 'DELETE' && r.url.endsWith('/reservas/101'));
    expect(req.request.params.keys()).toEqual([]);
    req.flush(respuesta202, { status: 202, statusText: 'Accepted' });

    expect(recibido).toEqual(respuesta202);
  });
});
