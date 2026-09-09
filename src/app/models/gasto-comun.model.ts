// Modelos que reflejan uno a uno los DTOs de ms-gastos-comunes, para no
// perder tipado entre el microservicio y este panel.

export type EstadoGasto = 'PENDIENTE' | 'PARCIAL' | 'PAGADO' | 'VENCIDO' | 'ANULADO';
export type OrigenGasto = 'MANUAL' | 'RESERVA_ESPACIO' | 'OTRO';
export type MetodoPago = 'TRANSFERENCIA' | 'TARJETA' | 'EFECTIVO' | 'OTRO';

export const ESTADOS_GASTO: EstadoGasto[] = ['PENDIENTE', 'PARCIAL', 'PAGADO', 'VENCIDO', 'ANULADO'];
export const METODOS_PAGO: MetodoPago[] = ['TRANSFERENCIA', 'TARJETA', 'EFECTIVO', 'OTRO'];

/** GastoComunResponse del microservicio. */
export interface GastoComun {
  id: number;
  unidadId: string;
  concepto: string;
  monto: number;
  saldoPendiente: number;
  estado: EstadoGasto;
  origen: OrigenGasto;
  referenciaExterna: string | null;
  fechaVencimiento: string | null; // LocalDate ISO ('YYYY-MM-DD')
  fechaCreacion: string; // Instant ISO
}

/** PagoResponse del microservicio. */
export interface Pago {
  id: number;
  gastoComunId: number;
  monto: number;
  metodo: MetodoPago;
  usuarioSub: string;
  comprobante: string | null;
  fechaPago: string; // Instant ISO
}

/** GastoComunRequest — alta manual (solo administrador/comité). */
export interface NuevoGastoComunRequest {
  unidadId: string;
  concepto: string;
  monto: number;
  fechaVencimiento?: string | null;
}

/** PagoRequest — registrar un abono/pago sobre un gasto común. */
export interface NuevoPagoRequest {
  monto: number;
  metodo: MetodoPago;
  comprobante?: string | null;
}

/**
 * Forma en que Spring Data serializa un `Page<T>` (solo los campos que
 * usamos acá).
 */
export interface PaginaSpring<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual, 0-based
  size: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

/** Cuerpo de error uniforme (ErrorResponse) devuelto por el BFF y por el microservicio. */
export interface ErrorApi {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
}
