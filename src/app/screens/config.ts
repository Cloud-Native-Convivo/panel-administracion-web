import { Component, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Shield } from 'lucide-angular';
import { RoleBadge } from '../shared/role-badge';
import { FieldInput } from '../shared/field-input';
import { Toggle } from '../shared/toggle';

@Component({
  selector: 'app-config',
  imports: [LucideAngularModule, RoleBadge, FieldInput, Toggle],
  templateUrl: './config.html',
})
export class Config {
  protected readonly nRsvs = signal(true);
  protected readonly nInc = signal(false);
  protected readonly nGastos = signal(true);
  protected readonly nNuevos = signal(true);

  protected readonly icShield = Shield;
}
