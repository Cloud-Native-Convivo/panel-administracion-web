import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { Building2, Users, Search, Calendar, Wallet } from 'lucide-angular';
import { MsalService } from '@azure/msal-angular';
import { StatusBadge } from '../shared/status-badge';
import { EspaciosService } from '../services/espacios.service';
import { GastosComunesService } from '../services/gastos-comunes.service';
import { ReservasService } from '../services/reservas.service';
import { saludoSegunHora } from '../shared/saludo';
import { formatoMonto } from '../shared/formato';
import { mapearReservaUi, type UiReservationEntry } from '../shared/reserva-mapper';
import type { Espacio } from '../models/espacio.model';

interface ResumenGastos {
  cargando: boolean;
  error: boolean;
  saldoPendienteTotal: number;
  vencidos: number;
  pendientes: number;
  pagados: number;
}

interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: LucideIconData;
  color: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [LucideAngularModule, StatusBadge],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  private readonly router = inject(Router);
  private readonly espaciosService = inject(EspaciosService);
  private readonly gastosComunesService = inject(GastosComunesService);
  private readonly reservasService = inject(ReservasService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly msalService = inject(MsalService);

  // "Total unidades" y "Usuarios activos" no tienen microservicio propio
  // todavía (no hay ms-condominios ni ms-usuarios) -- quedan como
  // "Próximamente" en vez de mostrar cifras inventadas en un despliegue real.
  protected readonly kpis = signal<Kpi[]>([
    { label: 'Total unidades',       value: '—',  sub: 'Próximamente',              icon: Building2, color: 'bg-teal-50 text-[#0D9488]' },
    { label: 'Usuarios activos',     value: '—',  sub: 'Próximamente',              icon: Users,     color: 'bg-blue-50 text-blue-600' },
    { label: 'Espacios habilitados', value: '—',  sub: 'Cargando…',                 icon: Search,    color: 'bg-violet-50 text-violet-600', route: 'espacios' },
    { label: 'Reservas hoy',         value: '—',  sub: 'Cargando…',                 icon: Calendar,  color: 'bg-orange-50 text-orange-600' },
  ]);

  protected readonly upcoming = signal<UiReservationEntry[]>([]);

  protected readonly resumenGastos = signal<ResumenGastos>({
    cargando: true,
    error: false,
    saldoPendienteTotal: 0,
    vencidos: 0,
    pendientes: 0,
    pagados: 0,
  });

  protected get saludo(): string {
    return saludoSegunHora();
  }

  protected get nombrePila(): string {
    const cuenta = this.msalService.instance.getActiveAccount();
    const nombre = cuenta?.name?.trim() || cuenta?.username?.trim() || 'Usuario Convivo';
    return nombre.split(/\s+/)[0];
  }

  protected get fechaHoy(): string {
    const texto = new Intl.DateTimeFormat('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date());
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  protected readonly formatoMonto = formatoMonto;

  // Iconos sueltos del template
  protected readonly icWallet = Wallet;

  ngOnInit(): void {
    this.cargarEspaciosKpi();
    this.cargarResumenGastos();
    this.cargarReservas();
  }

  /**
   * ponytail: pide una sola pagina grande (200) en vez de traer un
   * endpoint de resumen dedicado — alcanza para el volumen de un
   * condominio. Si el listado crece más, mover este cálculo al backend
   * (ej. GET /gastos-comunes/resumen).
   */
  protected cargarResumenGastos(): void {
    this.gastosComunesService
      .listar(0, 200)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pagina) => {
          const gastos = pagina.content;
          const saldoPendienteTotal = gastos
            .filter((g) => g.estado !== 'PAGADO' && g.estado !== 'ELIMINADO')
            .reduce((suma, g) => suma + g.saldoPendiente, 0);

          this.resumenGastos.set({
            cargando: false,
            error: false,
            saldoPendienteTotal,
            vencidos: gastos.filter((g) => g.estado === 'VENCIDO').length,
            pendientes: gastos.filter((g) => g.estado === 'PENDIENTE' || g.estado === 'PARCIAL').length,
            pagados: gastos.filter((g) => g.estado === 'PAGADO').length,
          });
        },
        error: () => {
          this.resumenGastos.update((r) => ({ ...r, cargando: false, error: true }));
        },
      });
  }

  protected cargarEspaciosKpi(): void {
    this.espaciosService
      .listar()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (espacios) => {
          if (!Array.isArray(espacios)) {
            return;
          }

          const habilitados = espacios.filter((e) => {
            const estado = (e?.estado || '').toLowerCase().trim();
            return estado === 'activo' || estado === 'habilitado';
          }).length;

          const mantencion = espacios.filter((e) => {
            const estado = (e?.estado || '').toLowerCase().trim();
            return (
              estado === 'mantenimiento' ||
              estado === 'en mantención' ||
              estado === 'en mantencion'
            );
          }).length;

          this.kpis.update((items) =>
            items.map((kpi) =>
              kpi.label === 'Espacios habilitados'
                ? {
                    ...kpi,
                    value: habilitados.toString(),
                    sub: `${mantencion} en mantención`,
                  }
                : kpi
            )
          );
        },
        error: (err) => {
          console.warn('No se pudieron sincronizar los espacios comunes con la BD:', err);
        },
      });
  }

  /**
   * Reservas de hoy (para el KPI) y las próximas 5 (para la tabla), a partir
   * del backend real de espacios comunes -- reemplaza el mock que traía el
   * dashboard antes de tener este microservicio conectado.
   */
  protected cargarReservas(): void {
    forkJoin({
      espacios: this.espaciosService.listar().pipe(
        catchError(() => of([] as Espacio[])),
      ),
      reservas: this.reservasService.listar().pipe(
        catchError(() => of([])),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ espacios, reservas }) => {
        const mapaEspacios = new Map<number, string>();
        for (const e of espacios) {
          mapaEspacios.set(e.id, e.nombre);
        }

        const mapeadas = reservas
          .map((r) => mapearReservaUi(r, mapaEspacios))
          .filter((r) => r.status !== 'cancelada')
          .sort((a, b) => a.fechaInicioIso.localeCompare(b.fechaInicioIso));

        this.upcoming.set(mapeadas.slice(0, 5));

        const hoy = new Date();
        const reservasHoy = mapeadas.filter((r) => {
          const d = new Date(r.fechaInicioIso);
          return (
            !isNaN(d.getTime()) &&
            d.getFullYear() === hoy.getFullYear() &&
            d.getMonth() === hoy.getMonth() &&
            d.getDate() === hoy.getDate()
          );
        });

        this.kpis.update((items) =>
          items.map((kpi) =>
            kpi.label === 'Reservas hoy'
              ? {
                  ...kpi,
                  value: reservasHoy.length.toString(),
                  sub:
                    reservasHoy.length === 0
                      ? 'Sin reservas para hoy'
                      : `${reservasHoy.filter((r) => r.status === 'confirmada').length} confirmadas, ${reservasHoy.filter((r) => r.status === 'pendiente').length} pendientes`,
                }
              : kpi,
          ),
        );
      });
  }

  protected onKpiClick(kpi: Kpi): void {
    if (kpi.route) {
      this.go(kpi.route);
    }
  }

  protected go(path: string): void {
    this.router.navigate(['/', path]);
  }
}
