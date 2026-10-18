import { Component, computed, input } from '@angular/core';

interface BadgeConfig {
  badge: string;
  dot: string;
}

const CONFIG: Record<string, BadgeConfig> = {
  activo: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
  inactivo: { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
  confirmada: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
  pendiente: { badge: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
  cancelada: { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
  moroso: { badge: 'bg-rose-50 text-rose-700 border-rose-200/60', dot: 'bg-rose-500' },
  habilitado: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
  'en mantención': { badge: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
  mantenimiento: { badge: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
  vacío: { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
  // Estados de EstadoGasto (gastos comunes), en minúscula.
  pagado: { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', dot: 'bg-emerald-500' },
  parcial: { badge: 'bg-amber-50 text-amber-700 border-amber-200/60', dot: 'bg-amber-500' },
  vencido: { badge: 'bg-rose-50 text-rose-700 border-rose-200/60', dot: 'bg-rose-500' },
  eliminado: { badge: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-400' },
};

const DEFAULT_CONFIG: BadgeConfig = {
  badge: 'bg-gray-100 text-gray-600 border-gray-200',
  dot: 'bg-gray-400',
};

@Component({
  selector: 'app-status-badge',
  template: `
    <span [class]="'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ' + styleConfig().badge">
      <span [class]="'w-1.5 h-1.5 rounded-full animate-pulse ' + styleConfig().dot"></span>
      {{ status() }}
    </span>
  `,
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly styleConfig = computed(
    () => CONFIG[this.status().toLowerCase()] ?? DEFAULT_CONFIG,
  );
}
