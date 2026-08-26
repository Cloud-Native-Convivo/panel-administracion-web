import { Component, computed, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Search, MoreHorizontal, X, Edit2, Plus } from 'lucide-angular';
import { USERS, ini } from '../data/sample-data';
import type { UserEntry } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';
import { RoleBadge } from '../shared/role-badge';

@Component({
  selector: 'app-users',
  imports: [LucideAngularModule, StatusBadge, RoleBadge],
  templateUrl: './users.html',
})
export class Users {
  protected readonly search = signal('');
  protected readonly role = signal('Todos');
  protected readonly selected = signal<UserEntry | null>(null);

  protected readonly roles = ['Todos', 'Propietario', 'Residente', 'Comité', 'Conserje', 'Administrador'];

  // Iconos del template
  protected readonly icSearch = Search;
  protected readonly icMore = MoreHorizontal;
  protected readonly icX = X;
  protected readonly icEdit = Edit2;
  protected readonly icPlus = Plus;

  protected readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    const r = this.role();
    return USERS.filter(u => {
      const ms =
        u.name.toLowerCase().includes(q) ||
        u.unit.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const mr = r === 'Todos' || u.role === r;
      return ms && mr;
    });
  });

  protected initials(name: string): string {
    return ini(name);
  }
}
