import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';
import { of } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GastosComunes } from './gastos-comunes';
import { GastosComunesService } from '../services/gastos-comunes.service';
import { type GastoComun } from '../models/gasto-comun.model';

describe('GastosComunes Screen UI Actions', () => {
  let component: GastosComunes;
  let mockService: {
    listar: ReturnType<typeof vi.fn>;
    obtener: ReturnType<typeof vi.fn>;
    crear: ReturnType<typeof vi.fn>;
    actualizar: ReturnType<typeof vi.fn>;
    eliminar: ReturnType<typeof vi.fn>;
    registrarPago: ReturnType<typeof vi.fn>;
    listarPagos: ReturnType<typeof vi.fn>;
  };
  let mockMsal: {
    instance: {
      getActiveAccount: ReturnType<typeof vi.fn>;
      getAllAccounts: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockService = {
      listar: vi.fn().mockReturnValue(of({ content: [], totalPages: 0, totalElements: 0 })),
      obtener: vi.fn(),
      crear: vi.fn(),
      actualizar: vi.fn(),
      eliminar: vi.fn().mockReturnValue(of(void 0)),
      registrarPago: vi.fn(),
      listarPagos: vi.fn().mockReturnValue(of({ content: [], totalPages: 0, totalElements: 0 })),
    };
    mockMsal = {
      instance: {
        getActiveAccount: vi.fn().mockReturnValue({ idTokenClaims: { roles: ['ADMIN'] } }),
        getAllAccounts: vi.fn().mockReturnValue([]),
      },
    };

    TestBed.configureTestingModule({
      providers: [
        GastosComunes,
        { provide: GastosComunesService, useValue: mockService },
        { provide: MsalService, useValue: mockMsal },
      ],
    });

    component = TestBed.inject(GastosComunes);
  });

  it('abrirNuevoCobro inicializa campos y muestra modal de cobro en modo creación', () => {
    (component as unknown as { abrirNuevoCobro: () => void }).abrirNuevoCobro();

    const state = component as unknown as {
      mostrarModalCobro: () => boolean;
      modoEdicionCobro: () => boolean;
      cobroUnidadId: () => string;
      cobroConcepto: () => string;
      cobroMonto: () => string;
    };
    expect(state.mostrarModalCobro()).toBe(true);
    expect(state.modoEdicionCobro()).toBe(false);
    expect(state.cobroUnidadId()).toBe('');
    expect(state.cobroConcepto()).toBe('');
    expect(state.cobroMonto()).toBe('');
  });

  it('abrirEditarCobro carga datos del gasto seleccionado y abre modal en modo edición', () => {
    const gastoMock: GastoComun = {
      id: 101,
      unidadId: 'DEP-402',
      concepto: 'Gasto común Mayo',
      monto: 85000,
      saldoPendiente: 85000,
      estado: 'PENDIENTE',
      origen: 'MANUAL',
      referenciaExterna: null,
      fechaCreacion: '2026-05-01T10:00:00Z',
      fechaVencimiento: '2026-05-15',
    };

    const state = component as unknown as {
      seleccionado: { set: (v: GastoComun | null) => void };
      abrirEditarCobro: () => void;
      mostrarModalCobro: () => boolean;
      modoEdicionCobro: () => boolean;
      cobroUnidadId: () => string;
      cobroConcepto: () => string;
      cobroMonto: () => string;
    };

    state.seleccionado.set(gastoMock);
    state.abrirEditarCobro();

    expect(state.mostrarModalCobro()).toBe(true);
    expect(state.modoEdicionCobro()).toBe(true);
    expect(state.cobroUnidadId()).toBe('DEP-402');
    expect(state.cobroConcepto()).toBe('Gasto común Mayo');
    expect(state.cobroMonto()).toBe('85000');
  });

  it('abrirRegistrarPago activa modal de pago con valores por defecto', () => {
    const state = component as unknown as {
      abrirRegistrarPago: () => void;
      mostrarRegistrarPago: () => boolean;
      pagoMetodo: () => string;
    };

    state.abrirRegistrarPago();

    expect(state.mostrarRegistrarPago()).toBe(true);
    expect(state.pagoMetodo()).toBe('TRANSFERENCIA');
  });

  it('abrirEliminarCobro y cerrarEliminarCobro manipulan visibilidad de confirmación', () => {
    const state = component as unknown as {
      abrirEliminarCobro: () => void;
      cerrarEliminarCobro: () => void;
      mostrarEliminarCobro: () => boolean;
    };

    state.abrirEliminarCobro();
    expect(state.mostrarEliminarCobro()).toBe(true);

    state.cerrarEliminarCobro();
    expect(state.mostrarEliminarCobro()).toBe(false);
  });
});
