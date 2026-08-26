import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Plus, Users, Clock, X, Camera } from 'lucide-angular';
import { ESPACIOS } from '../data/sample-data';
import type { EspacioEntry } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';
import { FieldInput } from '../shared/field-input';

@Component({
  selector: 'app-espacios',
  imports: [LucideAngularModule, StatusBadge, FieldInput],
  templateUrl: './espacios.html',
})
export class Espacios {
  protected readonly espacios = ESPACIOS;
  protected readonly editing = signal<EspacioEntry | null>(null);

  // Iconos del template
  protected readonly icPlus = Plus;
  protected readonly icUsers = Users;
  protected readonly icClock = Clock;
  protected readonly icX = X;
  protected readonly icCamera = Camera;
}
