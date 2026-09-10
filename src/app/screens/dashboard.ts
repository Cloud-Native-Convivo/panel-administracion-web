import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { Building2, Users, Search, Calendar, Plus } from 'lucide-angular';
import { MsalService } from '@azure/msal-angular';
import { INIT_RESERVATIONS } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';
import { EspaciosService } from '../services/espacios.service';
import { saludoSegunHora } from '../shared/saludo';

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
  private readonly destroyRef = inject(DestroyRef);
  private readonly msalService = inject(MsalService);

  protected readonly kpis = signal<Kpi[]>([
    { label: 'Total unidades',       value: '16', sub: '+2 incorporadas este mes',  icon: Building2, color: 'bg-teal-50 text-[#0D9488]' },
    { label: 'Usuarios activos',     value: '8',  sub: 'de 10 registrados',         icon: Users,     color: 'bg-blue-50 text-blue-600' },
    { label: 'Espacios habilitados', value: '5',  sub: '1 en mantención',           icon: Search,    color: 'bg-violet-50 text-violet-600', route: 'espacios' },
    { label: 'Reservas hoy',         value: '3',  sub: '2 confirmadas, 1 pendiente',icon: Calendar,  color: 'bg-orange-50 text-orange-600' },
  ]);

  protected readonly upcoming = INIT_RESERVATIONS.slice(0, 5);

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

  // Iconos sueltos del template
  protected readonly icPlus = Plus;
  protected readonly icBuilding = Building2;

  ngOnInit(): void {
    this.cargarEspaciosKpi();
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
