import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../environments/environment';
import type { JobEspacio } from '../models/espacio.model';
import { INTERVALO_SONDEO_MS } from './espacios.service';
import { GastosComunesService } from './gastos-comunes.service';

describe('GastosComunesService: espera del job (202)', () => {
  let service: GastosComunesService;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GastosComunesService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('esperarJob consulta el job de gastos en el bff hasta el estado final', () => {
    let final: JobEspacio | undefined;
    service.esperarJob('t1').subscribe((j) => (final = j));
    const url = `${environment.bffBaseUrl}/v1/gastos/jobs/t1`;

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http.expectOne(url).flush({ ticket_id: 't1', estado: 'PROCESANDO' });
    expect(final).toBeUndefined();

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http.expectOne(url).flush({ ticket_id: 't1', estado: 'COMPLETADO' });
    expect(final?.estado).toBe('COMPLETADO');
  });
});
