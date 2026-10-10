import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Espacios, FormularioEspacio } from './espacios';
import { EspaciosService } from '../services/espacios.service';
import { Espacio } from '../models/espacio.model';

describe('Espacios Screen UI Actions', () => {
  let component: Espacios;
  let mockService: {
    listar: ReturnType<typeof vi.fn>;
    obtenerPorId: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
  };

  const sampleEspacio: Espacio = {
    id: 1,
    nombre: 'Quincho Principal',
    descripcion: 'Parrilla y mesas',
    capacidad: 25,
    tarifa_hora: 15000,
    ubicacion: 'Piso 1',
    estado: 'activo',
    creado_en: '2026-01-01T00:00:00Z',
    actualizado_en: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    mockService = {
      listar: vi.fn().mockReturnValue(of([sampleEspacio])),
      obtenerPorId: vi.fn().mockReturnValue(of(sampleEspacio)),
      crear: vi.fn(),
      actualizar: vi.fn(),
      eliminar: vi.fn().mockReturnValue(of(void 0)),
    };

    TestBed.configureTestingModule({
      providers: [
        Espacios,
        { provide: EspaciosService, useValue: mockService },
      ],
    });

    component = TestBed.inject(Espacios);
  });

  it('abrirModalCrear inicializa el formulario por defecto y abre el modal', () => {
    const target = component as unknown as {
      abrirModalCrear: () => void;
      modalFormVisible: () => boolean;
      modoEdicion: () => boolean;
      espacioEnEdicion: () => Espacio | null;
      formulario: () => FormularioEspacio;
    };

    target.abrirModalCrear();

    expect(target.modalFormVisible()).toBe(true);
    expect(target.modoEdicion()).toBe(false);
    expect(target.espacioEnEdicion()).toBeNull();
    expect(target.formulario()).toEqual({
      nombre: '',
      capacidad: 10,
      tarifa_hora: 0,
      ubicacion: '',
      descripcion: '',
      estado: 'activo',
    });
  });

  it('abrirModalEditar carga datos del espacio y activa modo edicion', () => {
    const target = component as unknown as {
      abrirModalEditar: (e: Espacio) => void;
      modalFormVisible: () => boolean;
      modoEdicion: () => boolean;
      espacioEnEdicion: () => Espacio | null;
      formulario: () => FormularioEspacio;
    };

    target.abrirModalEditar(sampleEspacio);

    expect(target.modalFormVisible()).toBe(true);
    expect(target.modoEdicion()).toBe(true);
    expect(target.espacioEnEdicion()).toEqual(sampleEspacio);
    expect(target.formulario()).toEqual({
      nombre: 'Quincho Principal',
      capacidad: 25,
      tarifa_hora: 15000,
      ubicacion: 'Piso 1',
      descripcion: 'Parrilla y mesas',
      estado: 'activo',
    });
  });

  it('abrirModalEliminar y confirmarEliminar ejecutan borrado y actualizan feedback', () => {
    const target = component as unknown as {
      abrirModalEliminar: (e: Espacio) => void;
      confirmarEliminar: () => void;
      modalEliminarVisible: () => boolean;
      espacioAEliminar: () => Espacio | null;
      feedback: () => { tipo: string; mensaje: string } | null;
    };

    target.abrirModalEliminar(sampleEspacio);
    expect(target.modalEliminarVisible()).toBe(true);
    expect(target.espacioAEliminar()).toEqual(sampleEspacio);

    target.confirmarEliminar();

    expect(mockService.eliminar).toHaveBeenCalledWith(1);
    expect(target.modalEliminarVisible()).toBe(false);
    expect(target.feedback()).toEqual({
      tipo: 'exito',
      mensaje: 'Operación completada sobre "Quincho Principal" (eliminado o marcado como inactivo).',
    });
  });

  it('cerrarFeedback resetea el mensaje de feedback', () => {
    const target = component as unknown as {
      mostrarFeedback: (tipo: 'exito' | 'error', mensaje: string) => void;
      cerrarFeedback: () => void;
      feedback: () => { tipo: string; mensaje: string } | null;
    };

    target.mostrarFeedback('exito', 'Accion realizada');
    expect(target.feedback()).not.toBeNull();

    target.cerrarFeedback();
    expect(target.feedback()).toBeNull();
  });
});
