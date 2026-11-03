import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { Condominio } from '../models/condominio.model';
import { CondominiosService } from './condominios.service';

const KEY = 'convivo.condominioActivoId';

const condominio = (id: number): Condominio => ({
  id,
  nombre: `Condominio ${id}`,
  direccion: 'Calle de prueba 123',
  tipo: 'A',
  cantidad_sectores: 1,
  plan: 'basico',
  registro_minvu: null,
  seguro_incendio: false,
  plan_emergencia: false,
});

describe('CondominiosService: condominio activo en la sesión', () => {
  let service: CondominiosService;
  let http: HttpTestingController;

  const responderLista = (datos: Condominio[]) =>
    http.expectOne((req) => req.url.endsWith('/condominios')).flush(datos);

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CondominiosService);
    http = TestBed.inject(HttpTestingController);
  });

  it('guarda el id al seleccionar y lo borra al deseleccionar', () => {
    service.seleccionar(condominio(7));
    expect(sessionStorage.getItem(KEY)).toBe('7');

    service.seleccionar(null);
    expect(sessionStorage.getItem(KEY)).toBeNull();
    expect(service.condominioActivo()).toBeNull();
  });

  it('restaura el condominio activo guardado al cargar la lista', () => {
    sessionStorage.setItem(KEY, '2');

    service.cargarCondominios().subscribe();
    responderLista([condominio(1), condominio(2)]);

    expect(service.condominioActivo()?.id).toBe(2);
    expect(service.condominios().length).toBe(2);
  });

  it('no restaura nada si el id guardado ya no existe en la lista', () => {
    sessionStorage.setItem(KEY, '99');

    service.cargarCondominios().subscribe();
    responderLista([condominio(1)]);

    expect(service.condominioActivo()).toBeNull();
  });

  it('no pisa un condominio ya activo al cargar la lista', () => {
    sessionStorage.setItem(KEY, '2');
    service.condominioActivo.set(condominio(1));

    service.cargarCondominios().subscribe();
    responderLista([condominio(1), condominio(2)]);

    expect(service.condominioActivo()?.id).toBe(1);
  });

  it('loadCondominios sigue cargando la lista como antes', () => {
    service.loadCondominios();
    responderLista([condominio(1)]);

    expect(service.condominios().length).toBe(1);
    expect(service.loading()).toBe(false);
  });
});
