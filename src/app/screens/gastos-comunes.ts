import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { Plus, X, Wallet, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-angular';
import { MsalService } from '@azure/msal-angular';
import { finalize } from 'rxjs';

import { GastosComunesService } from '../services/gastos-comunes.service';
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

const TAMANO_PAGINA = 20;

@Component({
  selector: 'app-gastos-comunes',
  imports: [LucideAngularModule, StatusBadge],
  templateUrl: './gastos-comunes.html',
})
export class GastosComunes implements OnInit {
  private readonly service = inject(GastosComunesService);
  private readonly msalService = inject(MsalService);

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
  protected readonly roles = computed(() => rolesDeCuenta(this.msalService.instance.getActiveAccount()));
  // Optimista: si todavía no sabemos el rol (roles() vacío porque el App
  // Role de Entra no está configurado), igual mostramos la acción — el
  // backend la va a rechazar con 403 si de verdad no corresponde.
  protected readonly puedeCrearCobro = computed(() => {
    const r = this.roles();
    return r.length === 0 || r.includes('administrador') || r.includes('comite');
  });

  // --- Detalle (drawer) ---
  protected readonly seleccionado = signal<GastoComun | null>(null);
  protected readonly pagos = signal<Pago[]>([]);
  protected readonly cargandoPagos = signal(false);

  // --- Modal "Nuevo cobro" ---
  protected readonly mostrarNuevoCobro = signal(false);
  protected readonly nuevoUnidadId = signal('');
  protected readonly nuevoConcepto = signal('');
  protected readonly nuevoMonto = signal('');
  protected readonly nuevoVencimiento = signal('');
  protected readonly guardandoCobro = signal(false);
  protected readonly errorCobro = signal<string | null>(null);

  // --- Modal "Registrar pago" ---
  protected readonly mostrarRegistrarPago = signal(false);
  protected readonly pagoMonto = signal('');
  protected readonly pagoMetodo = signal<MetodoPago>('TRANSFERENCIA');
  protected readonly pagoComprobante = signal('');
  protected readonly guardandoPago = signal(false);
  protected readonly errorPago = signal<string | null>(null);
  protected readonly metodos = METODOS_PAGO;

  // Iconos del template
  protected readonly icPlus = Plus;
  protected readonly icX = X;
  protected readonly icWallet = Wallet;
  protected readonly icLeft = ChevronLeft;
  protected readonly icRight = ChevronRight;
  protected readonly icRefresh = RefreshCw;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    const unidad = this.filtroUnidad().trim();
    const fuente = unidad
      ? this.service.listarPorUnidad(unidad, this.pagina(), TAMANO_PAGINA)
      : this.service.listar(this.pagina(), TAMANO_PAGINA);

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
      .listarPagos(g.id, 0, 50)
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

  // --- Nuevo cobro ---

  protected abrirNuevoCobro(): void {
    this.nuevoUnidadId.set('');
    this.nuevoConcepto.set('');
    this.nuevoMonto.set('');
    this.nuevoVencimiento.set('');
    this.errorCobro.set(null);
    this.mostrarNuevoCobro.set(true);
  }

  protected cerrarNuevoCobro(): void {
    this.mostrarNuevoCobro.set(false);
  }

  protected get nuevoCobroValido(): boolean {
    const monto = Number(this.nuevoMonto());
    return this.nuevoUnidadId().trim().length > 0 && this.nuevoConcepto().trim().length > 0 && monto > 0;
  }

  protected guardarNuevoCobro(): void {
    if (!this.nuevoCobroValido) {
      return;
    }
    this.guardandoCobro.set(true);
    this.errorCobro.set(null);

    this.service
      .crear({
        unidadId: this.nuevoUnidadId().trim(),
        concepto: this.nuevoConcepto().trim(),
        monto: Number(this.nuevoMonto()),
        fechaVencimiento: this.nuevoVencimiento() || null,
      })
      .pipe(finalize(() => this.guardandoCobro.set(false)))
      .subscribe({
        next: () => {
          this.mostrarNuevoCobro.set(false);
          this.pagina.set(0);
          this.cargar();
        },
        error: (err: HttpErrorResponse) => this.errorCobro.set(this.mensajeError(err)),
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
    this.guardandoPago.set(true);
    this.errorPago.set(null);

    this.service
      .registrarPago(gasto.id, {
        monto: Number(this.pagoMonto()),
        metodo: this.pagoMetodo(),
        comprobante: this.pagoComprobante() || null,
      })
      .pipe(finalize(() => this.guardandoPago.set(false)))
      .subscribe({
        next: () => {
          this.mostrarRegistrarPago.set(false);
          // Refresca el detalle (saldo/estado) y el listado.
          this.service.obtener(gasto.id).subscribe((actualizado) => {
            this.seleccionado.set(actualizado);
            this.gastos.update((lista) => lista.map((g) => (g.id === actualizado.id ? actualizado : g)));
          });
          this.seleccionar(gasto);
        },
        error: (err: HttpErrorResponse) => this.errorPago.set(this.mensajeError(err)),
      });
  }

  // --- Utilidades ---

  protected formatoMonto(monto: number): string {
    return monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

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
    return (err.error?.message as string | undefined) ?? 'Ocurrió un error inesperado. Intenta de nuevo.';
  }
}
