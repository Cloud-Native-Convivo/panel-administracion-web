import { Component, computed, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Plus, Check, Trash2 } from 'lucide-angular';
import { INIT_RESERVATIONS } from '../data/sample-data';
import type { ReservationEntry, ReservationStatus } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';

@Component({
  selector: 'app-reservas',
  imports: [LucideAngularModule, StatusBadge],
  templateUrl: './reservas.html',
})
export class Reservas {
  protected readonly view = signal<'lista' | 'calendario'>('lista');
  protected readonly spaceFilter = signal('Todos');
  protected readonly statFilter = signal('Todos');
  protected readonly rsvs = signal<ReservationEntry[]>([...INIT_RESERVATIONS]);

  protected readonly views: ('lista' | 'calendario')[] = ['lista', 'calendario'];
  protected readonly weekDays = ['Lun 23', 'Mar 24', 'Mié 25', 'Jue 26', 'Vie 27', 'Sáb 28', 'Dom 29'];
  protected readonly spaceOptions = ['Todos', ...Array.from(new Set(INIT_RESERVATIONS.map(r => r.space)))];
  protected readonly statusOptions: ('Todos' | ReservationStatus)[] = ['Todos', 'confirmada', 'pendiente', 'cancelada'];

  // Iconos del template
  protected readonly icPlus = Plus;
  protected readonly icCheck = Check;
  protected readonly icTrash = Trash2;

  protected readonly filtered = computed(() =>
    this.rsvs().filter(r => {
      const ms = this.spaceFilter() === 'Todos' || r.space === this.spaceFilter();
      const mt = this.statFilter() === 'Todos' || r.status === this.statFilter();
      return ms && mt;
    }),
  );

  // Reservas por día de la semana (índices sobre el listado, igual que el prototipo)
  protected readonly cal = computed<ReservationEntry[][]>(() => {
    const r = this.rsvs();
    return [
      [r[0], r[1]].filter(Boolean),
      [r[2]].filter(Boolean),
      [r[3], r[4]].filter(Boolean),
      [r[5]].filter(Boolean),
      [r[6]].filter(Boolean),
      [],
      [],
    ];
  });

  protected confirm(id: number): void {
    this.rsvs.update(prev => prev.map(r => (r.id === id ? { ...r, status: 'confirmada' } : r)));
  }

  protected cancel(id: number): void {
    this.rsvs.update(prev => prev.map(r => (r.id === id ? { ...r, status: 'cancelada' } : r)));
  }

  protected capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
