import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, TimeoutError, of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Espacios, FormularioEspacio } from './espacios';
import { EspaciosService } from '../services/espacios.service';
import { CondominiosService } from '../services/condominios.service';
import { Espacio, JobEspacio, Respuesta202 } from '../models/espacio.model';

interface Pantalla {
  abrirModalCrear: () => void;
  abrirModalEditar: (e: Espacio) => void;
  abrirModalEliminar: (e: Espacio) => void;
  guardarEspacio: () => void;
  confirmarEliminar: () => void;
  mostrarFeedback: (tipo: 'exito' | 'error', mensaje: string) => void;
  cerrarFeedback: () => void;
  modalFormVisible: () => boolean;
  modoEdicion: () => boolean;
  espacioEnEdicion: () => Espacio | null;
  formulario: { (): FormularioEspacio; set: (f: FormularioEspacio) => void };
  modalEliminarVisible: () => boolean;
  espacioAEliminar: () => Espacio | null;
  espacios: () => Espacio[];
  feedback: () => { tipo: string; mensaje: string } | null;
  errorModal: () => string | null;
  errorModalEliminar: () => string | null;
  guardando: () => boolean;
  eliminando: () => boolean;
  solicitudesEnCurso: () => number;
}

const respuesta202: Respuesta202 = {
  ticket_id: 'ticket-1',
  estado: 'EN_COLA',
  status_url: '/api/v1/espacios-comunes/jobs/ticket-1',
  creado_en: '2026-11-10T12:00:00.000Z',
};

const jobCompletado = (accion: string, resultado: JobEspacio['resultado']): JobEspacio => ({
  ticket_id: 'ticket-1',
  modulo: 'ESPACIOS',
  accion,
  estado: 'COMPLETADO',
  resultado,
  error: null,
  creado_en: '2026-11-10T12:00:00',
  actualizado_en: '2026-11-10T12:00:01',
});

const jobFallido = (accion: string, mensaje: string, status_code = 404): JobEspacio => ({
  ...jobCompletado(accion, null),
  estado: 'FALLIDO',
  error: { codigo: 'NO_ENCONTRADO', mensaje, status_code },
});

const error503 = () =>
  throwError(() => new HttpErrorResponse({ status: 503, statusText: 'Service Unavailable' }));

describe('Espacios Screen UI Actions', () => {
  let component: Espacios;
  let pantalla: Pantalla;
  let mockService: {
    listar: ReturnType<typeof vi.fn>;
    obtenerPorId: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
    esperarJob: ReturnType<typeof vi.fn>;
  };

  const sampleEspacio: Espacio = {
    id: 1,
    condominio_id: 1,
    nombre: 'Quincho Principal',
    descripcion: 'Parrilla y mesas',
    capacidad: 25,
    tarifa_hora: 15000,
    ubicacion: 'Piso 1',
    estado: 'activo',
    creado_en: '2026-01-01T00:00:00Z',
    actualizado_en: '2026-01-01T00:00:00Z',
  };

  const espacioNuevo: Espacio = { ...sampleEspacio, id: 2, nombre: 'Piscina' };

  const formularioValido = (nombre = 'Piscina'): FormularioEspacio => ({
    nombre,
    capacidad: 20,
    tarifa_hora: 0,
    ubicacion: '',
    descripcion: '',
    estado: 'activo',
  });

  beforeEach(() => {
    mockService = {
      listar: vi.fn().mockReturnValue(of([sampleEspacio])),
      obtenerPorId: vi.fn().mockReturnValue(of(sampleEspacio)),
      crear: vi.fn().mockReturnValue(of(respuesta202)),
      actualizar: vi.fn().mockReturnValue(of(respuesta202)),
      eliminar: vi.fn().mockReturnValue(of(respuesta202)),
      esperarJob: vi.fn(),
    };

    const mockCondominiosService = {
      condominioActivo: signal({ id: 1, nombre: 'Condominio Central' }),
    };

    TestBed.configureTestingModule({
      providers: [
        Espacios,
        { provide: EspaciosService, useValue: mockService },
        { provide: CondominiosService, useValue: mockCondominiosService },
      ],
    });

    component = TestBed.inject(Espacios);
    pantalla = component as unknown as Pantalla;
  });

  it('abrirModalCrear inicializa el formulario por defecto y abre el modal', () => {
    pantalla.abrirModalCrear();

    expect(pantalla.modalFormVisible()).toBe(true);
    expect(pantalla.modoEdicion()).toBe(false);
    expect(pantalla.espacioEnEdicion()).toBeNull();
    expect(pantalla.formulario()).toEqual({
      nombre: '',
      capacidad: 10,
      tarifa_hora: 0,
      ubicacion: '',
      descripcion: '',
      estado: 'activo',
    });
  });

  it('abrirModalEditar carga datos del espacio y activa modo edicion', () => {
    pantalla.abrirModalEditar(sampleEspacio);

    expect(pantalla.modalFormVisible()).toBe(true);
    expect(pantalla.modoEdicion()).toBe(true);
    expect(pantalla.espacioEnEdicion()).toEqual(sampleEspacio);
    expect(pantalla.formulario()).toEqual({
      nombre: 'Quincho Principal',
      capacidad: 25,
      tarifa_hora: 15000,
      ubicacion: 'Piso 1',
      descripcion: 'Parrilla y mesas',
      estado: 'activo',
    });
  });

  it('cerrarFeedback resetea el mensaje de feedback', () => {
    pantalla.mostrarFeedback('exito', 'Accion realizada');
    expect(pantalla.feedback()).not.toBeNull();

    pantalla.cerrarFeedback();
    expect(pantalla.feedback()).toBeNull();
  });

  describe('crear espacio (202 + consulta del job)', () => {
    it('no agrega una tarjeta falsa ni dice "undefined": recarga la lista real al completarse', () => {
      mockService.esperarJob.mockReturnValue(
        of(jobCompletado('CREAR_ESPACIO', { id: 2, nombre: 'Piscina' })),
      );
      mockService.listar.mockReturnValue(of([sampleEspacio, espacioNuevo]));
      pantalla.abrirModalCrear();
      pantalla.formulario.set(formularioValido());

      pantalla.guardarEspacio();

      expect(mockService.esperarJob).toHaveBeenCalledWith('ticket-1');
      expect(pantalla.espacios()).toEqual([sampleEspacio, espacioNuevo]);
      expect(pantalla.espacios().some((e) => e.nombre === undefined)).toBe(false);
      expect(pantalla.feedback()).toEqual({
        tipo: 'exito',
        mensaje: 'Espacio "Piscina" creado correctamente.',
      });
      expect(pantalla.feedback()?.mensaje).not.toContain('undefined');
      expect(pantalla.modalFormVisible()).toBe(false);
      expect(pantalla.guardando()).toBe(false);
    });

    it('mientras el job está pendiente muestra "Solicitud enviada" y no toca la lista', () => {
      const pendiente = new Subject<JobEspacio>();
      mockService.esperarJob.mockReturnValue(pendiente);
      pantalla.abrirModalCrear();
      pantalla.formulario.set(formularioValido());

      pantalla.guardarEspacio();

      expect(pantalla.solicitudesEnCurso()).toBe(1);
      expect(pantalla.espacios()).toEqual([]);
      expect(pantalla.feedback()).toBeNull();

      pendiente.next(jobCompletado('CREAR_ESPACIO', { id: 2, nombre: 'Piscina' }));
      pendiente.complete();

      expect(pantalla.solicitudesEnCurso()).toBe(0);
    });

    it('si el job queda FALLIDO muestra el error del job y no recarga la lista', () => {
      mockService.esperarJob.mockReturnValue(
        of(jobFallido('CREAR_ESPACIO', 'La capacidad excede el máximo', 400)),
      );
      pantalla.abrirModalCrear();
      pantalla.formulario.set(formularioValido());

      pantalla.guardarEspacio();

      expect(pantalla.feedback()).toEqual({
        tipo: 'error',
        mensaje: 'No se pudo crear el espacio: La capacidad excede el máximo',
      });
      expect(mockService.listar).not.toHaveBeenCalled();
      expect(pantalla.solicitudesEnCurso()).toBe(0);
    });

    it('si el bff responde 503 muestra un error claro y no cierra el modal', () => {
      mockService.crear.mockReturnValue(error503());
      pantalla.abrirModalCrear();
      pantalla.formulario.set(formularioValido());

      pantalla.guardarEspacio();

      expect(pantalla.modalFormVisible()).toBe(true);
      expect(pantalla.errorModal()).toBe(
        'No se pudo enviar la solicitud: el servicio está ocupado. Intenta nuevamente en unos segundos.',
      );
      expect(pantalla.guardando()).toBe(false);
      expect(mockService.esperarJob).not.toHaveBeenCalled();
      expect(pantalla.solicitudesEnCurso()).toBe(0);
    });

    it('otros errores al enviar conservan el mensaje genérico y el modal abierto', () => {
      mockService.crear.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
      );
      pantalla.abrirModalCrear();
      pantalla.formulario.set(formularioValido());

      pantalla.guardarEspacio();

      expect(pantalla.modalFormVisible()).toBe(true);
      expect(pantalla.errorModal()).toBe(
        'Error al registrar el nuevo espacio común. Revisa la conexión.',
      );
    });
  });

  describe('editar espacio (202 + consulta del job)', () => {
    it('muestra el nombre real y recarga la lista al completarse', () => {
      const editado = { ...sampleEspacio, nombre: 'Quincho Norte' };
      mockService.esperarJob.mockReturnValue(
        of(jobCompletado('ACTUALIZAR_ESPACIO', { id: 1, nombre: 'Quincho Norte' })),
      );
      mockService.listar.mockReturnValue(of([editado]));
      pantalla.abrirModalEditar(sampleEspacio);
      pantalla.formulario.set(formularioValido('Quincho Norte'));

      pantalla.guardarEspacio();

      expect(mockService.actualizar).toHaveBeenCalledWith(
        1,
        1,
        expect.objectContaining({ nombre: 'Quincho Norte' }),
      );
      expect(pantalla.espacios()).toEqual([editado]);
      expect(pantalla.feedback()).toEqual({
        tipo: 'exito',
        mensaje: 'Espacio "Quincho Norte" actualizado correctamente.',
      });
      expect(pantalla.feedback()?.mensaje).not.toContain('undefined');
      expect(pantalla.modalFormVisible()).toBe(false);
    });

    it('si el resultado del job no trae nombre usa el del formulario, nunca "undefined"', () => {
      mockService.esperarJob.mockReturnValue(of(jobCompletado('ACTUALIZAR_ESPACIO', null)));
      pantalla.abrirModalEditar(sampleEspacio);
      pantalla.formulario.set(formularioValido('Quincho Sur'));

      pantalla.guardarEspacio();

      expect(pantalla.feedback()?.mensaje).toBe('Espacio "Quincho Sur" actualizado correctamente.');
    });

    it('si el job queda FALLIDO muestra el error del job', () => {
      mockService.esperarJob.mockReturnValue(
        of(jobFallido('ACTUALIZAR_ESPACIO', 'El espacio 1 no fue encontrado')),
      );
      pantalla.abrirModalEditar(sampleEspacio);

      pantalla.guardarEspacio();

      expect(pantalla.feedback()).toEqual({
        tipo: 'error',
        mensaje: 'No se pudo editar el espacio: El espacio 1 no fue encontrado',
      });
    });

    it('si el bff responde 503 muestra un error claro y no cierra el modal', () => {
      mockService.actualizar.mockReturnValue(error503());
      pantalla.abrirModalEditar(sampleEspacio);

      pantalla.guardarEspacio();

      expect(pantalla.modalFormVisible()).toBe(true);
      expect(pantalla.errorModal()).toContain('el servicio está ocupado');
      expect(pantalla.guardando()).toBe(false);
      expect(mockService.esperarJob).not.toHaveBeenCalled();
    });
  });

  describe('eliminar espacio (202 + consulta del job)', () => {
    it('informa "eliminado" y recarga la lista cuando se borró', () => {
      mockService.esperarJob.mockReturnValue(
        of(jobCompletado('ELIMINAR_ESPACIO', { espacio_id: 1, eliminado: true, resultado: 'eliminado' })),
      );
      mockService.listar.mockReturnValue(of([]));
      pantalla.abrirModalEliminar(sampleEspacio);
      expect(pantalla.modalEliminarVisible()).toBe(true);
      expect(pantalla.espacioAEliminar()).toEqual(sampleEspacio);

      pantalla.confirmarEliminar();

      expect(mockService.eliminar).toHaveBeenCalledWith(1, 1);
      expect(pantalla.modalEliminarVisible()).toBe(false);
      expect(pantalla.espacios()).toEqual([]);
      expect(pantalla.feedback()).toEqual({
        tipo: 'exito',
        mensaje: 'Espacio "Quincho Principal" eliminado.',
      });
    });

    it('informa "inactivo" cuando el servicio lo inactivó por tener reservas', () => {
      const inactivo = { ...sampleEspacio, estado: 'inactivo' };
      mockService.esperarJob.mockReturnValue(
        of(jobCompletado('ELIMINAR_ESPACIO', { espacio_id: 1, eliminado: false, resultado: 'inactivado' })),
      );
      mockService.listar.mockReturnValue(of([inactivo]));
      pantalla.abrirModalEliminar(sampleEspacio);

      pantalla.confirmarEliminar();

      expect(pantalla.espacios()).toEqual([inactivo]);
      expect(pantalla.feedback()).toEqual({
        tipo: 'exito',
        mensaje: 'Espacio "Quincho Principal" quedó inactivo porque tiene reservas registradas.',
      });
    });

    it('si el job queda FALLIDO muestra el error del job', () => {
      mockService.esperarJob.mockReturnValue(
        of(jobFallido('ELIMINAR_ESPACIO', 'El espacio 1 no fue encontrado')),
      );
      pantalla.abrirModalEliminar(sampleEspacio);

      pantalla.confirmarEliminar();

      expect(pantalla.feedback()).toEqual({
        tipo: 'error',
        mensaje: 'No se pudo eliminar el espacio: El espacio 1 no fue encontrado',
      });
    });

    it('si el bff responde 503 muestra un error claro y no cierra el modal', () => {
      mockService.eliminar.mockReturnValue(error503());
      pantalla.abrirModalEliminar(sampleEspacio);

      pantalla.confirmarEliminar();

      expect(pantalla.modalEliminarVisible()).toBe(true);
      expect(pantalla.errorModalEliminar()).toBe(
        'No se pudo enviar la solicitud: el servicio está ocupado. Intenta nuevamente en unos segundos.',
      );
      expect(pantalla.eliminando()).toBe(false);
      expect(mockService.esperarJob).not.toHaveBeenCalled();
    });
  });

  it('reabrir el modal de eliminar no arrastra el error 503 anterior', () => {
    mockService.eliminar.mockReturnValue(error503());
    pantalla.abrirModalEliminar(sampleEspacio);
    pantalla.confirmarEliminar();
    expect(pantalla.errorModalEliminar()).not.toBeNull();

    pantalla.abrirModalEliminar(sampleEspacio);

    expect(pantalla.errorModalEliminar()).toBeNull();
  });

  describe('cuando no se puede confirmar el resultado', () => {
    it('tras agotar los 30 s avisa que no se pudo confirmar y recarga la lista', () => {
      mockService.esperarJob.mockReturnValue(throwError(() => new TimeoutError()));
      mockService.listar.mockReturnValue(of([sampleEspacio, espacioNuevo]));
      pantalla.abrirModalCrear();
      pantalla.formulario.set(formularioValido());

      pantalla.guardarEspacio();

      expect(pantalla.feedback()).toEqual({
        tipo: 'error',
        mensaje:
          'No se pudo confirmar el resultado de la solicitud. Revisa la lista en unos momentos.',
      });
      expect(pantalla.espacios()).toEqual([sampleEspacio, espacioNuevo]);
      expect(pantalla.solicitudesEnCurso()).toBe(0);
    });

    it('si falla la consulta del job también avisa y recarga la lista', () => {
      mockService.esperarJob.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 500, statusText: 'Server Error' })),
      );
      pantalla.abrirModalEliminar(sampleEspacio);

      pantalla.confirmarEliminar();

      expect(pantalla.feedback()?.mensaje).toBe(
        'No se pudo confirmar el resultado de la solicitud. Revisa la lista en unos momentos.',
      );
      expect(mockService.listar).toHaveBeenCalledTimes(1);
      expect(pantalla.solicitudesEnCurso()).toBe(0);
    });
  });
});
