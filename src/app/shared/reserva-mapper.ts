import type { ReservationStatus } from '../data/sample-data';
import type { Reserva } from '../models/reserva.model';

export interface UiReservationEntry {
  id: number;
  space: string;
  user: string;
  unit: string;
  date: string;
  time: string;
  status: ReservationStatus;
  fechaInicioIso: string;
  montoTotal: number;
}

const ESTADO_MAPEADO: Record<string, ReservationStatus> = {
  pendiente_pago: 'pendiente',
  activa: 'confirmada',
  cancelada: 'cancelada',
  expirada: 'cancelada',
};

export function mapearReservaUi(
  r: Reserva,
  mapaEspacios: Map<number, string>,
): UiReservationEntry {
  const dInicio = new Date(r.fecha_inicio);
  const dFin = new Date(r.fecha_fin);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const horaInicio = !isNaN(dInicio.getTime())
    ? `${pad(dInicio.getHours())}:${pad(dInicio.getMinutes())}`
    : '--:--';
  const horaFin = !isNaN(dFin.getTime())
    ? `${pad(dFin.getHours())}:${pad(dFin.getMinutes())}`
    : '--:--';

  const { user, unit } = formatearUsuario(r.usuario_sub);
  const space = mapaEspacios.get(r.espacio_id) ?? `Espacio #${r.espacio_id}`;

  return {
    id: r.id,
    space,
    user,
    unit,
    date: formatearFecha(dInicio),
    time: `${horaInicio}–${horaFin}`,
    status: ESTADO_MAPEADO[r.estado] ?? 'pendiente',
    fechaInicioIso: r.fecha_inicio,
    montoTotal: r.monto_total,
  };
}

export function formatearUsuario(sub: string): { user: string; unit: string } {
  if (!sub) {
    return { user: 'Residente', unit: 'Condominio' };
  }
  if (sub === 'admin-sub-local') {
    return { user: 'Admin Local', unit: 'Oficina Admin' };
  }
  if (sub.includes('@')) {
    return { user: sub.split('@')[0], unit: 'Residente' };
  }
  if (sub.length > 16) {
    return { user: `Residente (${sub.slice(0, 8)})`, unit: 'Unidad Central' };
  }
  return { user: sub, unit: 'Residente' };
}

export function formatearFecha(d: Date): string {
  if (isNaN(d.getTime())) return 'Sin fecha';
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  const esMismoDia = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const meses = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
  ];
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const mesStr = meses[d.getMonth()];
  const diaNum = d.getDate();

  if (esMismoDia(d, hoy)) {
    return `Hoy, ${diaNum} ${mesStr}`;
  }
  if (esMismoDia(d, manana)) {
    return `Mañana, ${diaNum} ${mesStr}`;
  }
  return `${dias[d.getDay()]}, ${diaNum} ${mesStr}`;
}
