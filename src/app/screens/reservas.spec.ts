import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reservas } from './reservas';
import { ReservasService } from '../services/reservas.service';
import { EspaciosService } from '../services/espacios.service';
import { CondominiosService } from '../services/condominios.service';
import { Reserva } from '../models/reserva.model';
import { Espacio } from '../models/espacio.model';
import { UiReservationEntry } from '../shared/reserva-mapper';

describe('Reservas Screen UI Actions', () => {
  let component: Reservas;
  let mockReservasService: {
    listar: ReturnType<typeof vi.fn>;
  };
  let mockEspaciosService: {
    listar: ReturnType<typeof vi.fn>;
  };

  const sampleEspacio: Espacio = {
    id: 10,
    condominio_id: 1,
    nombre: 'Salón de Eventos',
    descripcion: 'Espacio común',
    capacidad: 50,
    tarifa_hora: 20000,
    ubicacion: 'Piso 1',
    estado: 'activo',
    creado_en: '2026-01-01T00:00:00Z',
    actualizado_en: '2026-01-01T00:00:00Z',
  };

  const sampleReserva: Reserva = {
    id: 101,
    espacio_id: 10,
    usuario_sub: 'depto-102@condominio.cl',
    fecha_inicio: '2026-10-15T14:00:00Z',
    fecha_fin: '2026-10-15T18:00:00Z',
    estado: 'pendiente_pago',
    monto_total: 80000,
    creado_en: '2026-10-10T10:00:00Z',
  };

  beforeEach(() => {
    mockReservasService = {
      listar: vi.fn().mockReturnValue(of([sampleReserva])),
    };
    mockEspaciosService = {
      listar: vi.fn().mockReturnValue(of([sampleEspacio])),
    };

    const mockCondominiosService = {
      condominioActivo: signal({ id: 1, nombre: 'Condominio Central' }),
    };

    TestBed.configureTestingModule({
      providers: [
        Reservas,
        { provide: ReservasService, useValue: mockReservasService },
        { provide: EspaciosService, useValue: mockEspaciosService },
        { provide: CondominiosService, useValue: mockCondominiosService },
      ],
    });

    component = TestBed.inject(Reservas);
  });

  it('cargarDatos inicializa la lista de reservas mapeada y el mapa de espacios', () => {
    component.ngOnInit();

    const target = component as unknown as {
      rsvs: () => UiReservationEntry[];
      espaciosMap: () => Map<number, string>;
    };

    const lista = target.rsvs();
    expect(lista.length).toBe(1);
    expect(lista[0].id).toBe(101);
    expect(lista[0].space).toBe('Salón de Eventos');
    expect(lista[0].status).toBe('pendiente');
  });

  describe('reserva en pendiente_pago (el pago se confirma por la cola reserva_pagada)', () => {
    const render = () => {
      const fixture = TestBed.createComponent(Reservas);
      fixture.detectChanges();
      return fixture.nativeElement as HTMLElement;
    };

    it('no ofrece el boton de confirmar pago', () => {
      const dom = render();

      expect(dom.querySelector('[aria-label^="Confirmar pago"]')).toBeNull();
      expect(dom.querySelector('[title="Confirmar pago de reserva"]')).toBeNull();
      expect(dom.textContent).not.toContain('Confirmar pago');
    });

    it('muestra el estado pendiente con el texto explicativo', () => {
      const dom = render();

      expect(dom.querySelector('[data-testid="pago-pendiente"]')?.textContent).toContain(
        'Se confirma al registrarse el pago del gasto común',
      );
    });

    it('no expone confirm en el componente ni confirmarPago en el servicio', () => {
      expect('confirm' in component).toBe(false);
      expect('confirmarPago' in ReservasService.prototype).toBe(false);
    });
  });

  it('cancel actualiza localmente el estado a cancelada y muestra feedback', () => {
    component.ngOnInit();

    const target = component as unknown as {
      cancel: (id: number) => void;
      rsvs: () => UiReservationEntry[];
      feedback: () => { tipo: string; mensaje: string } | null;
    };

    target.cancel(101);

    expect(target.rsvs()[0].status).toBe('cancelada');
    expect(target.feedback()).toEqual({
      tipo: 'exito',
      mensaje: 'Reserva #101 cancelada.',
    });
  });

  it('capitalize convierte correctamente la primera letra a mayuscula', () => {
    const target = component as unknown as {
      capitalize: (s: string) => string;
    };

    expect(target.capitalize('pendiente')).toBe('Pendiente');
    expect(target.capitalize('confirmada')).toBe('Confirmada');
    expect(target.capitalize('')).toBe('');
  });

  it('cerrarFeedback resetea el feedback reactivo a null', () => {
    const target = component as unknown as {
      cancel: (id: number) => void;
      cerrarFeedback: () => void;
      feedback: () => { tipo: string; mensaje: string } | null;
    };

    target.cancel(101);
    expect(target.feedback()).not.toBeNull();

    target.cerrarFeedback();
    expect(target.feedback()).toBeNull();
  });
});
