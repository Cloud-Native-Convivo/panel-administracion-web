import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  type WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import {
  Plus,
  X,
  Wallet,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Pencil,
  Trash2,
} from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { catchError, finalize, of, switchMap, type Observable } from 'rxjs';

import { GastosComunesService } from '../services/gastos-comunes.service';
import { CondominiosService } from '../services/condominios.service';
import type { Respuesta202 } from '../models/espacio.model';
import { MENSAJE_SERVICIO_OCUPADO, MENSAJE_SIN_CONFIRMAR } from '../shared/mensajes-solicitud';
import { UnidadesService } from '../services/unidades.service';
import { describirUnidad } from '../models/unidad.model';
import { rolesDeCuenta } from '../../auth/roles';
import {
  ESTADOS_GASTO,
  METODOS_PAGO,
  type EstadoGasto,
  type GastoComun,
  type MetodoPago,
  type Pago,
} from '../models/gasto-comun.model';
import { StatusBadge } from '../shared/status-badge';
import { ModalDialog } from '../shared/modal-dialog';
import { CurrencyPipe } from '@angular/common';

const TAMANO_PAGINA = 20;

/** ms-gastos-comunes aún no devuelve un error legible en el job: se muestra uno genérico. */
export const MENSAJE_JOB_GASTO_FALLIDO = 'No se pudo completar la operación. Intenta de nuevo.';
export const MENSAJE_ERROR_UNIDADES = 'No se pudieron cargar las unidades del condominio.';

@Component({
  selector: 'app-gastos-comunes',
  imports: [LucideAngularModule, StatusBadge, ModalDialog, CurrencyPipe, RouterLink],
  templateUrl: './gastos-comunes.html',
})
export class GastosComunes implements OnInit {
  private readonly service = inject(GastosComunesService);
  private readonly msalService = inject(MsalService);
  private readonly condominiosService = inject(CondominiosService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly unidadesService = inject(UnidadesService);

  private get condominioId(): string {
    return String(this.condominiosService.condominioActivo()!.id);
  }

  // --- Listado ---
  protected readonly gastos = signal<GastoComun[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly pagina = signal(0);
  protected readonly totalPaginas = signal(0);
  protected readonly totalElementos = signal(0);

  // --- Filtros (estado se filtra en cliente sobre la página actual; unidad va al backend) ---
  protected readonly filtroEstado = signal<'Todos' | EstadoGasto>('Todos');
  protected readonly filtroUnidad = signal('');
  protected readonly estados: ('Todos' | EstadoGasto)[] = ['Todos', ...ESTADOS_GASTO];

  protected readonly filtrados = computed(() => {
    const est = this.filtroEstado();
    const lista = this.gastos();
    return est === 'Todos' ? lista : lista.filter((g) => g.estado === est);
  });

  // --- Rol de la cuenta activa (best-effort, ver ../../auth/roles.ts) ---
  protected readonly roles = computed(() =>
    rolesDeCuenta(this.msalService.instance.getActiveAccount()),
  );
  // Control de acceso por mínimo privilegio (PoLP):
  // Solo se habilitan acciones administrativas si la cuenta tiene el rol asignado.
  protected readonly puedeCrearCobro = computed(() => {
    const r = this.roles();
    return r.includes('administrador') || r.includes('comite');
  });

  // --- Detalle (drawer) ---
  protected readonly seleccionado = signal<GastoComun | null>(null);
  protected readonly pagos = signal<Pago[]>([]);
  protected readonly cargandoPagos = signal(false);

  // Backend: eliminar() rechaza PAGADO/ELIMINADO; actualizar() solo rechaza ELIMINADO.
  protected readonly puedeEditarSeleccionado = computed(() => {
    const s = this.seleccionado();
    return !!s && this.puedeCrearCobro() && s.estado !== 'ELIMINADO';
  });
  protected readonly puedeEliminarSeleccionado = computed(() => {
    const s = this.seleccionado();
    return !!s && this.puedeCrearCobro() && s.estado !== 'PAGADO' && s.estado !== 'ELIMINADO';
  });

  // --- Modal "Nuevo cobro" / "Editar cobro" (mismo formulario, ver espacios.ts) ---
  protected readonly mostrarModalCobro = signal(false);
  protected readonly modoEdicionCobro = signal(false);
  protected readonly cobroUnidadId = signal('');
  protected readonly cobroConcepto = signal('');
  protected readonly cobroMonto = signal('');
  protected readonly cobroVencimiento = signal('');
  protected readonly guardandoCobro = signal(false);
  protected readonly errorCobro = signal<string | null>(null);
  // Unidades activas del condominio, como el texto que gastos guarda en unidadId
  // (el mismo que ms-condominios asigna al residente: describirUnidad).
  protected readonly unidadesCobro = signal<string[] | null>(null);
  protected readonly errorUnidades = signal<string | null>(null);

  // --- Modal "Registrar pago" ---
  protected readonly mostrarRegistrarPago = signal(false);
  protected readonly pagoMonto = signal('');
  protected readonly pagoMetodo = signal<MetodoPago>('TRANSFERENCIA');
  protected readonly pagoComprobante = signal('');
  protected readonly guardandoPago = signal(false);
  protected readonly errorPago = signal<string | null>(null);
  protected readonly metodos = METODOS_PAGO;

  // --- Confirmación "Eliminar cobro" ---
  protected readonly mostrarEliminarCobro = signal(false);
  protected readonly eliminandoCobro = signal(false);
  protected readonly errorEliminar = signal<string | null>(null);

  // Iconos del template
  protected readonly icPlus = Plus;
  protected readonly icX = X;
  protected readonly icWallet = Wallet;
  protected readonly icLeft = ChevronLeft;
  protected readonly icRight = ChevronRight;
  protected readonly icRefresh = RefreshCw;
  protected readonly icEdit = Pencil;
  protected readonly icTrash = Trash2;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const unidad = this.filtroUnidad().trim();
    const fuente = unidad
      ? this.service.listarPorUnidad(unidad, this.condominioId, this.pagina(), TAMANO_PAGINA)
      : this.service.listar(this.condominioId, this.pagina(), TAMANO_PAGINA);

    fuente.pipe(finalize(() => this.cargando.set(false))).subscribe({
      next: (page) => {
        this.gastos.set(page.content);
        this.totalPaginas.set(page.totalPages);
        this.totalElementos.set(page.totalElements);
      },
      error: (err: HttpErrorResponse) => {
        this.gastos.set([]);
        this.error.set(this.mensajeError(err));
      },
    });
  }

  protected buscarPorUnidad(): void {
    this.pagina.set(0);
    this.cargar();
  }

  protected limpiarFiltroUnidad(): void {
    this.filtroUnidad.set('');
    this.pagina.set(0);
    this.cargar();
  }

  protected paginaAnterior(): void {
    if (this.pagina() > 0) {
      this.pagina.update((p) => p - 1);
      this.cargar();
    }
  }

  protected paginaSiguiente(): void {
    if (this.pagina() + 1 < this.totalPaginas()) {
      this.pagina.update((p) => p + 1);
      this.cargar();
    }
  }

  // --- Detalle ---

  protected seleccionar(g: GastoComun): void {
    this.seleccionado.set(g);
    this.pagos.set([]);
    this.cargandoPagos.set(true);
    this.service
      .listarPagos(g.id, this.condominioId, 0, 50)
      .pipe(finalize(() => this.cargandoPagos.set(false)))
      .subscribe({
        next: (page) => this.pagos.set(page.content),
        error: () => this.pagos.set([]),
      });
  }

  protected cerrarDetalle(): void {
    this.seleccionado.set(null);
    this.pagos.set([]);
  }

  // --- Nuevo / Editar cobro (mismo formulario) ---

  protected abrirNuevoCobro(): void {
    this.cobroUnidadId.set('');
    this.cobroConcepto.set('');
    this.cobroMonto.set('');
    this.cobroVencimiento.set('');
    this.errorCobro.set(null);
    this.modoEdicionCobro.set(false);
    this.mostrarModalCobro.set(true);
    this.cargarUnidadesCobro();
  }

  private cargarUnidadesCobro(): void {
    const condominio = this.condominiosService.condominioActivo()!;
    this.unidadesCobro.set(null);
    this.errorUnidades.set(null);
    this.unidadesService.listar(condominio.id).subscribe({
      next: (lista) =>
        this.unidadesCobro.set(
          lista.filter((u) => u.activa).map((u) => describirUnidad(condominio.tipo, u)),
        ),
      error: () => this.errorUnidades.set(MENSAJE_ERROR_UNIDADES),
    });
  }

  protected abrirEditarCobro(): void {
    const gasto = this.seleccionado();
    if (!gasto) return;

    this.cobroUnidadId.set(gasto.unidadId);
    this.cobroConcepto.set(gasto.concepto);
    this.cobroMonto.set(String(gasto.monto));
    this.cobroVencimiento.set(gasto.fechaVencimiento ?? '');
    this.errorCobro.set(null);
    this.modoEdicionCobro.set(true);
    this.mostrarModalCobro.set(true);
  }

  protected cerrarModalCobro(): void {
    this.mostrarModalCobro.set(false);
  }

  protected get cobroValido(): boolean {
    const monto = Number(this.cobroMonto());
    const unidadValida = this.modoEdicionCobro() || this.cobroUnidadId().trim().length > 0;
    return unidadValida && this.cobroConcepto().trim().length > 0 && monto > 0;
  }

  protected guardarCobro(): void {
    if (!this.cobroValido) {
      return;
    }
    const gastoActual = this.seleccionado();
    if (this.modoEdicionCobro() && !gastoActual) {
      return;
    }
    const cambios = {
      concepto: this.cobroConcepto().trim(),
      monto: Number(this.cobroMonto()),
      fechaVencimiento: this.cobroVencimiento() || null,
    };

    const peticion =
      gastoActual && this.modoEdicionCobro()
        ? this.service.actualizar(gastoActual.id, this.cobroUnidadId(), this.condominioId, cambios)
        : this.service.crear({
            condominioId: this.condominioId,
            unidadId: this.cobroUnidadId().trim(),
            ...cambios,
          });

    this.despachar(peticion, this.guardandoCobro, this.errorCobro, () => {
      this.mostrarModalCobro.set(false);
      if (gastoActual && this.modoEdicionCobro()) {
        this.service
          .obtener(gastoActual.id, this.condominioId)
          .subscribe((g) => this.seleccionado.set(g));
      } else {
        this.pagina.set(0);
      }
      this.cargar();
    });
  }

  // --- Registrar pago ---

  protected abrirRegistrarPago(): void {
    this.pagoMonto.set('');
    this.pagoMetodo.set('TRANSFERENCIA');
    this.pagoComprobante.set('');
    this.errorPago.set(null);
    this.mostrarRegistrarPago.set(true);
  }

  protected cerrarRegistrarPago(): void {
    this.mostrarRegistrarPago.set(false);
  }

  protected get pagoValido(): boolean {
    return Number(this.pagoMonto()) > 0;
  }

  protected guardarPago(): void {
    const gasto = this.seleccionado();
    if (!gasto || !this.pagoValido) {
      return;
    }
    const peticion = this.service.registrarPago(gasto.id, this.condominioId, {
      monto: Number(this.pagoMonto()),
      metodo: this.pagoMetodo(),
      comprobante: this.pagoComprobante() || null,
    });

    this.despachar(peticion, this.guardandoPago, this.errorPago, () => {
      this.mostrarRegistrarPago.set(false);
      // Refresca el listado, los pagos y el detalle (saldo/estado).
      this.cargar();
      this.seleccionar(gasto);
      this.service.obtener(gasto.id, this.condominioId).subscribe((g) => this.seleccionado.set(g));
    });
  }

  // --- Eliminar cobro ---

  protected abrirEliminarCobro(): void {
    this.errorEliminar.set(null);
    this.mostrarEliminarCobro.set(true);
  }

  protected cerrarEliminarCobro(): void {
    this.mostrarEliminarCobro.set(false);
  }

  protected confirmarEliminarCobro(): void {
    const gasto = this.seleccionado();
    if (!gasto) return;

    this.despachar(
      this.service.eliminar(gasto.id, this.condominioId),
      this.eliminandoCobro,
      this.errorEliminar,
      () => {
        this.mostrarEliminarCobro.set(false);
        // Borrado lógico: al recargar queda con estado ELIMINADO, no desaparece.
        this.cerrarDetalle();
        this.cargar();
      },
    );
  }

  /**
   * El bff acepta la mutación con 202 y un ticket: el modal sigue abierto
   * (botón en curso) hasta que el job termina, y solo COMPLETADO lo cierra.
   * El error del job no se lee porque gastos aún no lo devuelve legible.
   */
  private despachar(
    solicitud: Observable<Respuesta202>,
    enCurso: WritableSignal<boolean>,
    error: WritableSignal<string | null>,
    alCompletar: () => void,
  ): void {
    enCurso.set(true);
    error.set(null);
    solicitud
      .pipe(
        switchMap((aceptada) =>
          this.service.esperarJob(aceptada.ticket_id).pipe(
            catchError((err) => {
              console.error('No se pudo confirmar el resultado de la solicitud:', err);
              return of(null);
            }),
          ),
        ),
        finalize(() => enCurso.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (job) => {
          if (job?.estado === 'COMPLETADO') {
            alCompletar();
          } else {
            error.set(job ? MENSAJE_JOB_GASTO_FALLIDO : MENSAJE_SIN_CONFIRMAR);
          }
        },
        error: (err: HttpErrorResponse) => error.set(this.mensajeError(err)),
      });
  }

  // --- Utilidades ---

  protected formatoFecha(iso: string | null): string {
    if (!iso) {
      return '—';
    }
    return new Date(iso).toLocaleDateString('es-CL');
  }

  private mensajeError(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el BFF. ¿Está corriendo en bffBaseUrl (por defecto http://localhost:3000)?';
    }
    if (err.status === 401) {
      return 'Tu sesión expiró o no es válida. Vuelve a iniciar sesión.';
    }
    if (err.status === 503) {
      return MENSAJE_SERVICIO_OCUPADO;
    }
    if (err.status === 403) {
      return (
        (err.error?.message as string | undefined) ??
        'No tienes permiso para esta acción. Si tu cuenta debería tenerlo, probablemente falta registrar los App Roles en Entra ID.'
      );
    }
    if (err.status === 502) {
      return (
        (err.error?.message as string | undefined) ??
        'El microservicio de Gastos Comunes no respondió (¿está corriendo en el puerto 8083?).'
      );
    }
    return (
      (err.error?.message as string | undefined) ?? 'Ocurrió un error inesperado. Intenta de nuevo.'
    );
  }
}
