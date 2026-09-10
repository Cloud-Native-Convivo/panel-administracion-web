import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { Building2, Users, Search, Calendar, Plus, Wallet } from 'lucide-angular';
import { MsalService } from '@azure/msal-angular';
import { INIT_RESERVATIONS } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';
import { EspaciosService } from '../services/espacios.service';
import { GastosComunesService } from '../services/gastos-comunes.service';
import { saludoSegunHora } from '../shared/saludo';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly msalService = inject(MsalService);

  protected readonly kpis = signal<Kpi[]>([
    { label: 'Total unidades',       value: '16', sub: '+2 incorporadas este mes',  icon: Building2, color: 'bg-teal-50 text-[#0D9488]' },
    { label: 'Usuarios activos',     value: '8',  sub: 'de 10 registrados',         icon: Users,     color: 'bg-blue-50 text-blue-600' },
    { label: 'Espacios habilitados', value: '5',  sub: '1 en mantención',           icon: Search,    color: 'bg-violet-50 text-violet-600', route: 'espacios' },
    { label: 'Reservas hoy',         value: '3',  sub: '2 confirmadas, 1 pendiente',icon: Calendar,  color: 'bg-orange-50 text-orange-600' },
  ]);

  protected readonly upcoming = INIT_RESERVATIONS.slice(0, 5);

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
    const nombre = cuenta?.name ?? cuenta?.username ?? 'Usuario Convivo';
    return nombre.trim().split(/\s+/)[0];
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

  protected formatoMonto(monto: number): string {
    return monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
  }

  // Iconos sueltos del template
  protected readonly icPlus = Plus;
  protected readonly icBuilding = Building2;
  protected readonly icWallet = Wallet;

  ngOnInit(): void {
    this.cargarEspaciosKpi();
    this.cargarResumenGastos();
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

  protected onKpiClick(kpi: Kpi): void {
    if (kpi.route) {
      this.go(kpi.route);
    }
  }

  protected go(path: string): void {
    this.router.navigate(['/', path]);
  }
}
