import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { NEVER, of, Subject, TimeoutError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpErrorResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import {
  GastosComunes,
  MENSAJE_ERROR_UNIDADES,
  MENSAJE_JOB_GASTO_FALLIDO,
} from './gastos-comunes';
import { UnidadesService } from '../services/unidades.service';
import type { Unidad } from '../models/unidad.model';
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
        { provide: CondominiosService, useValue: { condominioActivo: signal({ id: 1, nombre: 'Test' }) } },
        { provide: UnidadesService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
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
        { provide: UnidadesService, useValue: { listar: vi.fn().mockReturnValue(of([])) } },
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

describe('GastosComunes: selector de unidad en "Nuevo cobro"', () => {
  const unidad = (id: number, numero: string, activa = true): Unidad => ({
    id,
    condominio_id: 1,
    torre: 'A',
    piso: '3',
    numero,
    activa,
  });

  let unidades$: Subject<Unidad[]>;
  let mockUnidades: { listar: ReturnType<typeof vi.fn> };
  let mockGastos: Record<string, ReturnType<typeof vi.fn>>;

  // jsdom no implementa <dialog>.showModal(), que usa ModalDialog al montar.
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal ??= vi.fn();
    HTMLDialogElement.prototype.close ??= vi.fn();
  });

  const montar = () => {
    unidades$ = new Subject();
    mockUnidades = { listar: vi.fn().mockReturnValue(unidades$) };
    mockGastos = {
      listar: vi.fn().mockReturnValue(of({ content: [], totalPages: 0, totalElements: 0 })),
      crear: vi.fn().mockReturnValue(of({ ticket_id: 't1' })),
      esperarJob: vi.fn().mockReturnValue(NEVER),
    };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [GastosComunes],
      providers: [
        provideRouter([]),
        { provide: GastosComunesService, useValue: mockGastos },
        { provide: UnidadesService, useValue: mockUnidades },
        {
          provide: MsalService,
          useValue: {
            instance: {
              getActiveAccount: vi.fn().mockReturnValue({ idTokenClaims: { roles: ['ADMIN'] } }),
              getAllAccounts: vi.fn().mockReturnValue([]),
            },
          },
        },
        {
          provide: CondominiosService,
          useValue: { condominioActivo: signal({ id: 1, nombre: 'Test', tipo: 'A' }) },
        },
      ],
    });
    const fixture = TestBed.createComponent(GastosComunes);
    fixture.detectChanges();
    const estado = fixture.componentInstance as unknown as {
      abrirNuevoCobro: () => void;
      guardarCobro: () => void;
      cobroConcepto: { set: (v: string) => void };
      cobroMonto: { set: (v: string) => void };
    };
    estado.abrirNuevoCobro();
    fixture.detectChanges();
    const dom = fixture.nativeElement as HTMLElement;
    const refrescar = () => fixture.detectChanges();
    return { estado, dom, refrescar };
  };

  it('lista solo las unidades activas del condominio activo, con el texto que usa gastos', () => {
    const { dom, refrescar } = montar();

    expect(mockUnidades.listar).toHaveBeenCalledWith(1);
    unidades$.next([unidad(1, '301'), unidad(2, '302', false)]);
    refrescar();

    const opciones = Array.from(dom.querySelectorAll<HTMLOptionElement>('#cobro-unidad option'))
      .filter((o) => o.value)
      .map((o) => o.value);
    expect(opciones).toEqual(['Torre A · Piso 3 · Unidad 301']);
  });

  it('no permite guardar sin elegir una unidad', () => {
    const { estado, dom, refrescar } = montar();
    unidades$.next([unidad(1, '301')]);
    estado.cobroConcepto.set('Cuota');
    estado.cobroMonto.set('1000');
    refrescar();

    const crear = Array.from(dom.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Crear cobro'),
    );
    expect(crear?.disabled).toBe(true);
    estado.guardarCobro();
    expect(mockGastos['crear']).not.toHaveBeenCalled();

    const select = dom.querySelector<HTMLSelectElement>('#cobro-unidad')!;
    select.value = 'Torre A · Piso 3 · Unidad 301';
    select.dispatchEvent(new Event('change'));
    refrescar();
    expect(crear?.disabled).toBe(false);
    estado.guardarCobro();
    expect(mockGastos['crear']).toHaveBeenCalledWith(
      expect.objectContaining({ unidadId: 'Torre A · Piso 3 · Unidad 301' }),
    );
  });

  it('sin unidades activas muestra un aviso con enlace a Unidades', () => {
    const { dom, refrescar } = montar();
    unidades$.next([unidad(2, '302', false)]);
    refrescar();

    expect(dom.querySelector('#cobro-unidad')).toBeNull();
    const enlace = dom.querySelector<HTMLAnchorElement>('a[href="/unidades"]');
    expect(enlace).toBeTruthy();
    expect(dom.textContent).toContain('No hay unidades activas');
  });

  it('si falla la carga de unidades muestra un error', () => {
    const { dom, refrescar } = montar();
    unidades$.error(new HttpErrorResponse({ status: 500 }));
    refrescar();

    const alerta = Array.from(dom.querySelectorAll('[role="alert"]')).map((a) => a.textContent);
    expect(alerta.join(' ')).toContain(MENSAJE_ERROR_UNIDADES);
    expect(dom.querySelector('#cobro-unidad')).toBeNull();
  });
});
