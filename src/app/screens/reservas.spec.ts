import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, TimeoutError, of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reservas } from './reservas';
import { ReservasService } from '../services/reservas.service';
import { EspaciosService } from '../services/espacios.service';
import { CondominiosService } from '../services/condominios.service';
import { Reserva } from '../models/reserva.model';
import { Espacio, JobEspacio, Respuesta202 } from '../models/espacio.model';
import { UiReservationEntry } from '../shared/reserva-mapper';

interface Pantalla {
  rsvs: () => UiReservationEntry[];
  feedback: () => { tipo: string; mensaje: string } | null;
  cerrarFeedback: () => void;
  solicitudesEnCurso: () => number;
  modalCancelarVisible: () => boolean;
  reservaACancelar: () => UiReservationEntry | null;
  errorModalCancelar: () => string | null;
  cancelando: () => boolean;
  abrirModalCancelar: (r: UiReservationEntry) => void;
  cerrarModalCancelar: () => void;
  confirmarCancelacion: () => void;
}

const respuesta202: Respuesta202 = {
  ticket_id: 'ticket-1',
  estado: 'EN_COLA',
  status_url: '/api/v1/espacios-comunes/jobs/ticket-1',
  creado_en: '2026-11-16T12:00:00.000Z',
};

const jobCompletado: JobEspacio = {
  ticket_id: 'ticket-1',
  modulo: 'ESPACIOS',
  accion: 'CANCELAR_RESERVA',
  estado: 'COMPLETADO',
  resultado: { id: 101, estado: 'cancelada' },
  error: null,
  creado_en: '2026-11-16T12:00:00',
  actualizado_en: '2026-11-16T12:00:01',
};

const jobFallido: JobEspacio = {
  ...jobCompletado,
  estado: 'FALLIDO',
  resultado: null,
  error: { codigo: 'NO_AUTORIZADO', mensaje: 'No autorizado para cancelar la reserva 101', status_code: 403 },
};

const MENSAJE_SERVICIO_OCUPADO =
  'No se pudo enviar la solicitud: el servicio está ocupado. Intenta nuevamente en unos segundos.';
const MENSAJE_SIN_CONFIRMAR =
  'No se pudo confirmar el resultado de la solicitud. Revisa la lista en unos momentos.';

describe('Reservas Screen UI Actions', () => {
  let component: Reservas;
  let mockReservasService: {
    listar: ReturnType<typeof vi.fn>;
    cancelar: ReturnType<typeof vi.fn>;
  };
  let mockEspaciosService: {
    listar: ReturnType<typeof vi.fn>;
    esperarJob: ReturnType<typeof vi.fn>;
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
      cancelar: vi.fn().mockReturnValue(of(respuesta202)),
    };
    mockEspaciosService = {
      listar: vi.fn().mockReturnValue(of([sampleEspacio])),
      esperarJob: vi.fn(),
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

  describe('cancelar reserva (DELETE asíncrono con 202 y job)', () => {
    let pantalla: Pantalla;
    const reservaCancelada: Reserva = { ...sampleReserva, estado: 'cancelada' };

    const cancelarFila = () => {
      pantalla.abrirModalCancelar(pantalla.rsvs()[0]);
      pantalla.confirmarCancelacion();
    };

    beforeEach(() => {
      pantalla = component as unknown as Pantalla;
      component.ngOnInit();
    });

    it('abrir el modal guarda la reserva elegida sin llamar al servidor', () => {
      pantalla.abrirModalCancelar(pantalla.rsvs()[0]);

      expect(pantalla.modalCancelarVisible()).toBe(true);
      expect(pantalla.reservaACancelar()?.id).toBe(101);
      expect(mockReservasService.cancelar).not.toHaveBeenCalled();
    });

    it('mientras el job está pendiente muestra "Solicitud enviada" y no marca la fila', () => {
      mockEspaciosService.esperarJob.mockReturnValue(new Subject<JobEspacio>());

      cancelarFila();

      expect(mockReservasService.cancelar).toHaveBeenCalledWith(101);
      expect(mockEspaciosService.esperarJob).toHaveBeenCalledWith('ticket-1');
      expect(pantalla.modalCancelarVisible()).toBe(false);
      expect(pantalla.solicitudesEnCurso()).toBe(1);
      expect(pantalla.rsvs()[0].status).toBe('pendiente');
      expect(mockReservasService.listar).toHaveBeenCalledTimes(1);
    });

    it('el banner "Solicitud enviada" aparece en pantalla mientras se procesa', () => {
      mockEspaciosService.esperarJob.mockReturnValue(new Subject<JobEspacio>());
      const fixture = TestBed.createComponent(Reservas);
      fixture.detectChanges();
      pantalla = fixture.componentInstance as unknown as Pantalla;

      cancelarFila();
      fixture.detectChanges();

      const dom = fixture.nativeElement as HTMLElement;
      expect(dom.querySelector('[role="status"]')?.textContent).toContain('Solicitud enviada');
    });

    it('con el job COMPLETADO informa éxito y recarga la lista real', () => {
      mockEspaciosService.esperarJob.mockReturnValue(of(jobCompletado));
      mockReservasService.listar.mockReturnValue(of([reservaCancelada]));

      cancelarFila();

      expect(mockReservasService.listar).toHaveBeenCalledTimes(2);
      expect(pantalla.rsvs()[0].status).toBe('cancelada');
      expect(pantalla.solicitudesEnCurso()).toBe(0);
      expect(pantalla.feedback()).toEqual({ tipo: 'exito', mensaje: 'Reserva #101 cancelada.' });
    });

    it('con el job FALLIDO muestra el error real del job y no recarga', () => {
      mockEspaciosService.esperarJob.mockReturnValue(of(jobFallido));

      cancelarFila();

      expect(pantalla.feedback()).toEqual({
        tipo: 'error',
        mensaje: 'No se pudo cancelar la reserva #101: No autorizado para cancelar la reserva 101',
      });
      expect(mockReservasService.listar).toHaveBeenCalledTimes(1);
      expect(pantalla.rsvs()[0].status).toBe('pendiente');
    });

    it('si el bff responde 503 deja el modal abierto con el error y la fila intacta', () => {
      mockReservasService.cancelar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' })),
      );

      cancelarFila();

      expect(pantalla.modalCancelarVisible()).toBe(true);
      expect(pantalla.reservaACancelar()?.id).toBe(101);
      expect(pantalla.errorModalCancelar()).toBe(MENSAJE_SERVICIO_OCUPADO);
      expect(pantalla.cancelando()).toBe(false);
      expect(pantalla.rsvs()[0].status).toBe('pendiente');
      expect(mockEspaciosService.esperarJob).not.toHaveBeenCalled();
    });

    it('con otro error al enviar muestra un mensaje genérico en el modal', () => {
      mockReservasService.cancelar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })),
      );

      cancelarFila();

      expect(pantalla.modalCancelarVisible()).toBe(true);
      expect(pantalla.errorModalCancelar()).toBe('No se pudo cancelar la reserva.');
    });

    it('si no se puede confirmar el resultado avisa y recarga la lista', () => {
      mockEspaciosService.esperarJob.mockReturnValue(throwError(() => new TimeoutError()));

      cancelarFila();

      expect(pantalla.feedback()).toEqual({ tipo: 'error', mensaje: MENSAJE_SIN_CONFIRMAR });
      expect(mockReservasService.listar).toHaveBeenCalledTimes(2);
      expect(pantalla.solicitudesEnCurso()).toBe(0);
    });

    it('confirmar dos veces no envía la cancelación dos veces', () => {
      mockEspaciosService.esperarJob.mockReturnValue(new Subject<JobEspacio>());

      cancelarFila();
      pantalla.confirmarCancelacion();

      expect(mockReservasService.cancelar).toHaveBeenCalledTimes(1);
    });

    it('reabrir el modal no arrastra el error 503 anterior', () => {
      mockReservasService.cancelar.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' })),
      );
      cancelarFila();
      expect(pantalla.errorModalCancelar()).not.toBeNull();

      pantalla.cerrarModalCancelar();
      pantalla.abrirModalCancelar(pantalla.rsvs()[0]);

      expect(pantalla.errorModalCancelar()).toBeNull();
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
    mockEspaciosService.esperarJob.mockReturnValue(of(jobCompletado));
    component.ngOnInit();
    const target = component as unknown as Pantalla;

    target.abrirModalCancelar(target.rsvs()[0]);
    target.confirmarCancelacion();
    expect(target.feedback()).not.toBeNull();

    target.cerrarFeedback();
    expect(target.feedback()).toBeNull();
  });
});
