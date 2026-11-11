export interface Espacio {
  id: number;
  condominio_id: number;
  nombre: string;
  descripcion: string | null;
  capacidad: number;
  tarifa_hora: number;
  ubicacion: string | null;
  estado: 'activo' | 'inactivo' | 'mantenimiento' | string;
  creado_en: string;
  actualizado_en: string;
  img?: string;
}

export interface CrearEspacioDto {
  condominio_id: number;
  nombre: string;
  capacidad: number;
  tarifa_hora?: number;
  descripcion?: string | null;
  ubicacion?: string | null;
}

export interface ActualizarEspacioDto {
  nombre?: string;
  capacidad?: number;
  tarifa_hora?: number;
  descripcion?: string | null;
  ubicacion?: string | null;
  estado?: string;
}

/** Cuerpo del 202 con el que el bff acepta una mutación asíncrona de espacios. */
export interface Respuesta202 {
  ticket_id: string;
  estado: string;
  status_url: string;
  creado_en: string;
}

export type EstadoJob = 'EN_COLA' | 'PROCESANDO' | 'COMPLETADO' | 'FALLIDO';

export interface ErrorJob {
  codigo: string;
  mensaje: string;
  status_code: number;
}

/** Resultado de GET /espacios-comunes/jobs/{ticket}. */
export interface JobEspacio {
  ticket_id: string;
  modulo: string;
  accion: string;
  estado: EstadoJob;
  resultado: Record<string, unknown> | null;
  error: ErrorJob | null;
  creado_en: string | null;
  actualizado_en: string | null;
}
