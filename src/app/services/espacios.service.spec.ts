import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TimeoutError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JobEspacio, Respuesta202 } from '../models/espacio.model';
import {
  EspaciosService,
  INTERVALO_SONDEO_MS,
  TIEMPO_MAXIMO_ESPERA_MS,
} from './espacios.service';

const respuesta202: Respuesta202 = {
  ticket_id: 't1',
  estado: 'EN_COLA',
  status_url: '/api/v1/espacios-comunes/jobs/t1',
  creado_en: '2026-11-10T12:00:00.000Z',
};

const job = (estado: JobEspacio['estado'], extra: Partial<JobEspacio> = {}): JobEspacio => ({
  ticket_id: 't1',
  modulo: 'ESPACIOS',
  accion: 'CREAR_ESPACIO',
  estado,
  resultado: null,
  error: null,
  creado_en: '2026-11-10T12:00:00',
  actualizado_en: '2026-11-10T12:00:01',
  ...extra,
});

describe('EspaciosService: mutaciones asíncronas (202)', () => {
  let service: EspaciosService;
  let http: HttpTestingController;

  const esConsultaDeJob = (req: { url: string }) => req.url.endsWith('/jobs/t1');

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EspaciosService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('el intervalo y el tope de espera son 2 s y 30 s', () => {
    expect(INTERVALO_SONDEO_MS).toBe(2000);
    expect(TIEMPO_MAXIMO_ESPERA_MS).toBe(30000);
  });

  it('crear devuelve el cuerpo 202 tal cual, sin tratarlo como un espacio', () => {
    let recibido: unknown;
    service
      .crear({ condominio_id: 1, nombre: 'Piscina', capacidad: 20 })
      .subscribe((r) => (recibido = r));

    http
      .expectOne((req) => req.method === 'POST')
      .flush(respuesta202, { status: 202, statusText: 'Accepted' });

    expect(recibido).toEqual(respuesta202);
  });

  it('actualizar y eliminar devuelven el cuerpo 202 tal cual', () => {
    const recibidos: unknown[] = [];
    service.actualizar(5, 1, { nombre: 'Nuevo' }).subscribe((r) => recibidos.push(r));
    http
      .expectOne((req) => req.method === 'PUT')
      .flush(respuesta202, { status: 202, statusText: 'Accepted' });
    service.eliminar(5, 1).subscribe((r) => recibidos.push(r));
    http
      .expectOne((req) => req.method === 'DELETE')
      .flush(respuesta202, { status: 202, statusText: 'Accepted' });

    expect(recibidos).toEqual([respuesta202, respuesta202]);
  });

  it('esperarJob consulta el job cada 2 s y termina en el primer estado final', () => {
    let final: JobEspacio | undefined;
    service.esperarJob('t1').subscribe((j) => (final = j));

    http.expectNone(esConsultaDeJob);

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http.expectOne(esConsultaDeJob).flush(job('PROCESANDO'));
    expect(final).toBeUndefined();

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http
      .expectOne(esConsultaDeJob)
      .flush(job('COMPLETADO', { resultado: { id: 9, nombre: 'Piscina' } }));
    expect(final?.estado).toBe('COMPLETADO');

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS * 3);
    http.expectNone(esConsultaDeJob);
  });

  it('esperarJob también termina con FALLIDO y entrega el error del job', () => {
    let final: JobEspacio | undefined;
    service.esperarJob('t1').subscribe((j) => (final = j));

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http.expectOne(esConsultaDeJob).flush(
      job('FALLIDO', {
        error: { codigo: 'NO_ENCONTRADO', mensaje: 'Espacio 5 no encontrado', status_code: 404 },
      }),
    );

    expect(final?.estado).toBe('FALLIDO');
    expect(final?.error?.mensaje).toBe('Espacio 5 no encontrado');
  });

  it('esperarJob tolera un 404 inicial (el consumidor aún no registra el job)', () => {
    let final: JobEspacio | undefined;
    let fallo: unknown;
    service.esperarJob('t1').subscribe({ next: (j) => (final = j), error: (e) => (fallo = e) });

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http.expectOne(esConsultaDeJob).flush(null, { status: 404, statusText: 'Not Found' });
    expect(fallo).toBeUndefined();

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http.expectOne(esConsultaDeJob).flush(job('COMPLETADO'));
    expect(final?.estado).toBe('COMPLETADO');
  });

  it('esperarJob propaga los errores distintos de 404', () => {
    let fallo: { status?: number } | undefined;
    service.esperarJob('t1').subscribe({ error: (e) => (fallo = e) });

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
    http.expectOne(esConsultaDeJob).flush(null, { status: 500, statusText: 'Server Error' });

    expect(fallo?.status).toBe(500);
  });

  it('esperarJob falla con TimeoutError si el job no termina en 30 s', () => {
    let fallo: unknown;
    service.esperarJob('t1').subscribe({ error: (e) => (fallo = e) });

    const responderPendientes = () =>
      http.match(esConsultaDeJob).forEach((req) => req.flush(job('EN_COLA')));

    for (let t = 0; t < TIEMPO_MAXIMO_ESPERA_MS - INTERVALO_SONDEO_MS; t += INTERVALO_SONDEO_MS) {
      vi.advanceTimersByTime(INTERVALO_SONDEO_MS);
      responderPendientes();
    }
    expect(fallo).toBeUndefined();

    vi.advanceTimersByTime(INTERVALO_SONDEO_MS + 1);
    responderPendientes();
    expect(fallo).toBeInstanceOf(TimeoutError);
  });
});
