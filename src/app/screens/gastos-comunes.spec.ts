import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { of, Subject, TimeoutError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GastosComunes, MENSAJE_JOB_GASTO_FALLIDO } from './gastos-comunes';
import { MENSAJE_SIN_CONFIRMAR } from '../shared/mensajes-solicitud';
import { GastosComunesService } from '../services/gastos-comunes.service';
import { CondominiosService } from '../services/condominios.service';
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
      condominioId: '1',
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

  it('renderiza la cabecera Monto con alineación a la derecha y skeleton loaders cuando está cargando', () => {
    mockService.listar = vi.fn().mockReturnValue(new Subject());
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GastosComunes],
      providers: [
        { provide: GastosComunesService, useValue: mockService },
        { provide: MsalService, useValue: mockMsal },
        { provide: CondominiosService, useValue: { condominioActivo: signal({ id: 1, nombre: 'Test' }) } },
      ],
    });
    const fixture = TestBed.createComponent(GastosComunes);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.animate-pulse')).toBeTruthy();
    const ths = Array.from(compiled.querySelectorAll('th'));
    const thMonto = ths.find((th) => th.textContent?.trim() === 'Monto');
    expect(thMonto?.className).toContain('text-right');
  });
});

describe('GastosComunes: mutaciones esperan el job del 202', () => {
  type Estado = Record<string, unknown> & {
    seleccionado: { set: (v: GastoComun | null) => void };
  };
  type Signal = () => unknown;

  const gasto: GastoComun = {
    id: 7,
    condominioId: '1',
    unidadId: 'A-101',
    concepto: 'Cuota',
    monto: 1000,
    saldoPendiente: 1000,
    estado: 'PENDIENTE',
    origen: 'MANUAL',
    referenciaExterna: null,
    fechaCreacion: '2026-11-01T10:00:00Z',
    fechaVencimiento: null,
  };
  const aceptada = { ticket_id: 't1', estado: 'EN_COLA', status_url: '/x', creado_en: '' };

  // Cada operación: cómo abrir su modal, cómo confirmarla y qué signals mira.
  const operaciones = [
    {
      nombre: 'crear cobro',
      metodo: 'crear',
      abrir: (s: Estado) => {
        (s['abrirNuevoCobro'] as () => void)();
        (s['cobroUnidadId'] as { set: (v: string) => void }).set('A-101');
        (s['cobroConcepto'] as { set: (v: string) => void }).set('Cuota');
        (s['cobroMonto'] as { set: (v: string) => void }).set('1000');
      },
      confirmar: 'guardarCobro',
      modal: 'mostrarModalCobro',
      error: 'errorCobro',
    },
    {
      nombre: 'editar cobro',
      metodo: 'actualizar',
      abrir: (s: Estado) => (s['abrirEditarCobro'] as () => void)(),
      confirmar: 'guardarCobro',
      modal: 'mostrarModalCobro',
      error: 'errorCobro',
    },
    {
      nombre: 'eliminar cobro',
      metodo: 'eliminar',
      abrir: (s: Estado) => (s['abrirEliminarCobro'] as () => void)(),
      confirmar: 'confirmarEliminarCobro',
      modal: 'mostrarEliminarCobro',
      error: 'errorEliminar',
    },
    {
      nombre: 'registrar pago',
      metodo: 'registrarPago',
      abrir: (s: Estado) => {
        (s['abrirRegistrarPago'] as () => void)();
        (s['pagoMonto'] as { set: (v: string) => void }).set('500');
      },
      confirmar: 'guardarPago',
      modal: 'mostrarRegistrarPago',
      error: 'errorPago',
    },
  ];

  let job$: Subject<{ estado: string }>;
  let mockService: Record<string, ReturnType<typeof vi.fn>>;

  const preparar = (op: (typeof operaciones)[number]): Estado => {
    job$ = new Subject();
    mockService = {
      listar: vi.fn().mockReturnValue(of({ content: [gasto], totalPages: 1, totalElements: 1 })),
      obtener: vi.fn().mockReturnValue(of(gasto)),
      listarPagos: vi.fn().mockReturnValue(of({ content: [], totalPages: 0, totalElements: 0 })),
      crear: vi.fn(),
      actualizar: vi.fn(),
      eliminar: vi.fn(),
      registrarPago: vi.fn(),
      esperarJob: vi.fn().mockReturnValue(job$),
    };
    mockService[op.metodo].mockReturnValue(of(aceptada));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        GastosComunes,
        { provide: GastosComunesService, useValue: mockService },
        {
          provide: MsalService,
          useValue: {
            instance: {
              getActiveAccount: vi.fn().mockReturnValue({ idTokenClaims: { roles: ['ADMIN'] } }),
              getAllAccounts: vi.fn().mockReturnValue([]),
            },
          },
        },
        { provide: CondominiosService, useValue: { condominioActivo: signal({ id: 1, nombre: 'Test' }) } },
      ],
    });
    const s = TestBed.inject(GastosComunes) as unknown as Estado;
    s.seleccionado.set(gasto);
    op.abrir(s);
    (s[op.confirmar] as () => void)();
    return s;
  };

  it.each(operaciones)('$nombre: el modal sigue abierto hasta COMPLETADO y luego recarga la lista', (op) => {
    const s = preparar(op);

    expect(mockService['esperarJob']).toHaveBeenCalledWith('t1');
    expect((s[op.modal] as Signal)()).toBe(true);
    expect(mockService['listar']).not.toHaveBeenCalled();

    job$.next({ estado: 'COMPLETADO' });

    expect((s[op.modal] as Signal)()).toBe(false);
    expect(mockService['listar']).toHaveBeenCalled();
    expect((s[op.error] as Signal)()).toBeNull();
  });

  it.each(operaciones)('$nombre: job FALLIDO muestra error genérico y el modal sigue abierto', (op) => {
    const s = preparar(op);

    job$.next({ estado: 'FALLIDO' });

    expect((s[op.modal] as Signal)()).toBe(true);
    expect((s[op.error] as Signal)()).toBe(MENSAJE_JOB_GASTO_FALLIDO);
    expect(mockService['listar']).not.toHaveBeenCalled();
  });

  it.each(operaciones)('$nombre: si se agota la espera muestra error y el modal sigue abierto', (op) => {
    const s = preparar(op);

    job$.error(new TimeoutError());

    expect((s[op.modal] as Signal)()).toBe(true);
    expect((s[op.error] as Signal)()).toBe(MENSAJE_SIN_CONFIRMAR);
  });
});
