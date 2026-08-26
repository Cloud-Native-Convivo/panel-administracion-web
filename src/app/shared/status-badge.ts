import { Component, computed, input } from '@angular/core';

// Estilos por estado; fallback = inactivo
const STYLES: Record<string, string> = {
  activo:          "bg-teal-50 text-teal-700 border-teal-100",
  inactivo:        "bg-gray-100 text-gray-500 border-gray-200",
  confirmada:      "bg-teal-50 text-teal-700 border-teal-100",
  pendiente:       "bg-yellow-50 text-yellow-700 border-yellow-200",
  cancelada:       "bg-gray-100 text-gray-400 border-gray-200",
  moroso:          "bg-red-50 text-red-700 border-red-100",
  habilitado:      "bg-teal-50 text-teal-700 border-teal-100",
  "en mantención": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "vacío":         "bg-gray-100 text-gray-400 border-gray-200",
};

@Component({
  selector: 'app-status-badge',
  template: `<span [class]="cls()">{{ status() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly cls = computed(
    () =>
      `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        STYLES[this.status()] ?? STYLES['inactivo']
      }`,
  );
}
