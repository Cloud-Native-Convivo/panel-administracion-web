export interface Espacio {
  id: number;
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
