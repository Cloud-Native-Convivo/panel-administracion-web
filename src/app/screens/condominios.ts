import { Component, computed, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  Building2, AlertCircle, Plus, ChevronRight, ChevronDown, X, Edit2,
} from 'lucide-angular';
import { TORRES } from '../data/sample-data';
import type { UnitEntry } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';

@Component({
  selector: 'app-condominios',
  imports: [LucideAngularModule, StatusBadge],
  templateUrl: './condominios.html',
})
export class Condominios {
  protected readonly torres = TORRES;
  protected readonly expanded = signal<Set<string>>(new Set(['A', 'B']));
  protected readonly selectedUnit = signal<UnitEntry | null>(null);
  protected readonly selectedTorre = signal('');

  // Iconos del template
  protected readonly icBuilding = Building2;
  protected readonly icAlert = AlertCircle;
  protected readonly icPlus = Plus;
  protected readonly icChevronRight = ChevronRight;
  protected readonly icChevronDown = ChevronDown;
  protected readonly icX = X;
  protected readonly icEdit = Edit2;

  protected readonly totalMorosos = computed(
    () => TORRES.flatMap(t => t.units).filter(u => u.moroso).length,
  );

  protected toggle(id: string): void {
    this.expanded.update(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected morososDe(torreId: string): number {
    return TORRES.find(t => t.id === torreId)!.units.filter(u => u.moroso).length;
  }

  protected selectUnit(unit: UnitEntry, torreName: string): void {
    this.selectedUnit.set(unit);
    this.selectedTorre.set(torreName);
  }
}
