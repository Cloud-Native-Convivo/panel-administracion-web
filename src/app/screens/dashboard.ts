import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import { Building2, Users, Search, Calendar, Plus } from 'lucide-angular';
import { INIT_RESERVATIONS } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';

interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: LucideIconData;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [LucideAngularModule, StatusBadge],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly router = inject(Router);

  protected readonly kpis: Kpi[] = [
    { label: 'Total unidades',       value: '16', sub: '+2 incorporadas este mes',  icon: Building2, color: 'bg-teal-50 text-[#0D9488]' },
    { label: 'Usuarios activos',     value: '8',  sub: 'de 10 registrados',         icon: Users,     color: 'bg-blue-50 text-blue-600' },
    { label: 'Espacios habilitados', value: '5',  sub: '1 en mantención',           icon: Search,    color: 'bg-violet-50 text-violet-600' },
    { label: 'Reservas hoy',         value: '3',  sub: '2 confirmadas, 1 pendiente',icon: Calendar,  color: 'bg-orange-50 text-orange-600' },
  ];

  protected readonly upcoming = INIT_RESERVATIONS.slice(0, 5);

  // Iconos sueltos del template
  protected readonly icPlus = Plus;
  protected readonly icBuilding = Building2;

  protected go(path: string): void {
    this.router.navigate(['/', path]);
  }
}
