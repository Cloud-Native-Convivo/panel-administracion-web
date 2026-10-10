import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reservas } from './reservas';
import { ReservasService } from '../services/reservas.service';
import { EspaciosService } from '../services/espacios.service';
import { Reserva } from '../models/reserva.model';
import { Espacio } from '../models/espacio.model';
import { UiReservationEntry } from '../shared/reserva-mapper';

describe('Reservas Screen UI Actions', () => {
  let component: Reservas;
  let mockReservasService: {
    listar: ReturnType<typeof vi.fn>;
    confirmarPago: ReturnType<typeof vi.fn>;
  };
  let mockEspaciosService: {
    listar: ReturnType<typeof vi.fn>;
  };

  const sampleEspacio: Espacio = {
    id: 10,
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
      confirmarPago: vi.fn().mockReturnValue(of({ ...sampleReserva, estado: 'activa' })),
    };
    mockEspaciosService = {
      listar: vi.fn().mockReturnValue(of([sampleEspacio])),
    };

    TestBed.configureTestingModule({
      providers: [
        Reservas,
        { provide: ReservasService, useValue: mockReservasService },
        { provide: EspaciosService, useValue: mockEspaciosService },
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

  it('confirm ejecuta confirmacion de pago y actualiza el estado a confirmada', () => {
    component.ngOnInit();

    const target = component as unknown as {
      confirm: (id: number) => void;
      rsvs: () => UiReservationEntry[];
      feedback: () => { tipo: string; mensaje: string } | null;
    };

    target.confirm(101);

    expect(mockReservasService.confirmarPago).toHaveBeenCalledWith(101);
    expect(target.rsvs()[0].status).toBe('confirmada');
    expect(target.feedback()).toEqual({
      tipo: 'exito',
      mensaje: 'Reserva #101 confirmada exitosamente.',
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
