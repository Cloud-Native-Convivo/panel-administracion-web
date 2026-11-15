import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Unidades } from './unidades';
import { UnidadesService } from '../services/unidades.service';
import { CondominiosService } from '../services/condominios.service';
import { Unidad, describirUnidad } from '../models/unidad.model';

type Expuesto = {
  numero: { set(v: string): void };
  piso: { set(v: string): void };
  torre: { set(v: string): void };
  errorForm(): string | null;
  unidades(): Unidad[];
  crear(e: Event): void;
  cambiarActiva(u: Unidad): void;
  cargar(): void;
};

describe('Pantalla Unidades', () => {
  let servicio: {
    listar: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    cambiarActiva: ReturnType<typeof vi.fn>;
  };
  const evento = { preventDefault: vi.fn() } as unknown as Event;

  function montar(tipo: 'A' | 'B'): Expuesto {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        Unidades,
        { provide: UnidadesService, useValue: servicio },
        { provide: CondominiosService, useValue: { condominioActivo: signal({ id: 7, nombre: 'Parque', tipo }) } },
      ],
    });
    return TestBed.inject(Unidades) as unknown as Expuesto;
  }

  beforeEach(() => {
    servicio = {
      listar: vi.fn().mockReturnValue(of([])),
      crear: vi.fn(),
      cambiarActiva: vi.fn(),
    };
  });

  it('en un condominio de casas envía solo el número, aunque haya torre o piso escritos', () => {
    servicio.crear.mockReturnValue(of({ id: 1, condominio_id: 7, torre: 'UNICA', piso: '0', numero: '24', activa: true }));
    const pantalla = montar('B');
    pantalla.numero.set(' 24 ');
    pantalla.piso.set('3');
    pantalla.torre.set('A');

    pantalla.crear(evento);

    expect(servicio.crear).toHaveBeenCalledWith(7, { numero: '24' });
    expect(pantalla.unidades()).toHaveLength(1);
  });

  it('en un condominio de torres exige el piso antes de llamar al servidor', () => {
    const pantalla = montar('A');
    pantalla.numero.set('504');

    pantalla.crear(evento);

    expect(servicio.crear).not.toHaveBeenCalled();
    expect(pantalla.errorForm()).toBe('Indica el piso del departamento.');
  });

  it('en un condominio de torres omite la torre vacía', () => {
    servicio.crear.mockReturnValue(of({ id: 2, condominio_id: 7, torre: 'UNICA', piso: '5', numero: '504', activa: true }));
    const pantalla = montar('A');
    pantalla.numero.set('504');
    pantalla.piso.set('5');

    pantalla.crear(evento);

    expect(servicio.crear).toHaveBeenCalledWith(7, { numero: '504', piso: '5' });
  });

  it('muestra el message del 422 del servidor junto al formulario', () => {
    servicio.crear.mockReturnValue(
      throwError(() => ({ status: 422, error: { message: 'En un condominio de torres (tipo A) el piso es obligatorio' } })),
    );
    const pantalla = montar('A');
    pantalla.numero.set('504');
    pantalla.piso.set('5');

    pantalla.crear(evento);

    expect(pantalla.errorForm()).toBe('En un condominio de torres (tipo A) el piso es obligatorio');
  });

  it('un 422 de Pydantic (detail en lista) muestra un mensaje genérico', () => {
    servicio.crear.mockReturnValue(throwError(() => ({ status: 422, error: { detail: [{ msg: 'x' }] } })));
    const pantalla = montar('B');
    pantalla.numero.set('24');

    pantalla.crear(evento);

    expect(pantalla.errorForm()).toBe('Revisa los datos de la unidad.');
  });

  it('al desactivar sin mostrar inactivas, la unidad sale de la lista', () => {
    const unidad: Unidad = { id: 3, condominio_id: 7, torre: 'UNICA', piso: '0', numero: '24', activa: true };
    servicio.listar.mockReturnValue(of([unidad]));
    servicio.cambiarActiva.mockReturnValue(of({ ...unidad, activa: false }));
    const pantalla = montar('B');
    pantalla.cargar();

    pantalla.cambiarActiva(unidad);

    expect(servicio.cambiarActiva).toHaveBeenCalledWith(7, 3, false);
    expect(pantalla.unidades()).toEqual([]);
  });
});

describe('describirUnidad', () => {
  it('arma el mismo texto que ms-condominios', () => {
    expect(describirUnidad('B', { torre: 'UNICA', piso: '0', numero: '24' })).toBe('Casa 24');
    expect(describirUnidad('A', { torre: 'UNICA', piso: '5', numero: '504' })).toBe('Piso 5 · Unidad 504');
    expect(describirUnidad('A', { torre: 'B', piso: '5', numero: '504' })).toBe('Torre B · Piso 5 · Unidad 504');
  });
});
