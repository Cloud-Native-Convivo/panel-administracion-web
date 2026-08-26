import { Component, computed, input } from '@angular/core';

// Estilos por rol; fallback = Residente
const STYLES: Record<string, string> = {
  Administrador: 'bg-violet-50 text-violet-700 border-violet-100',
  Comité:        'bg-blue-50 text-blue-700 border-blue-100',
  Conserje:      'bg-orange-50 text-orange-700 border-orange-100',
  Propietario:   'bg-teal-50 text-teal-700 border-teal-100',
  Residente:     'bg-gray-100 text-gray-600 border-gray-200',
};

@Component({
  selector: 'app-role-badge',
  template: `<span [class]="cls()">{{ role() }}</span>`,
})
export class RoleBadge {
  readonly role = input.required<string>();
  readonly cls = computed(
    () =>
      `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        STYLES[this.role()] ?? STYLES['Residente']
      }`,
  );
}
