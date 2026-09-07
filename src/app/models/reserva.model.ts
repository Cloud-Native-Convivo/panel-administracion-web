export type EstadoReservaBackend = 'pendiente_pago' | 'activa' | 'cancelada' | 'expirada';

export interface Reserva {
  id: number;
  espacio_id: number;
  usuario_sub: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: EstadoReservaBackend;
  monto_total: number;
  expira_en?: string;
  creado_en: string;
}
