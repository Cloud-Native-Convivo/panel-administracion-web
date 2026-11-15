/** Unidad de un condominio, tal como la devuelve ms-condominios. */
export interface Unidad {
  id: number;
  condominio_id: number;
  torre: string;
  piso: string;
  numero: string;
  activa: boolean;
}

/**
 * Alta de unidad. En tipo B (casas) basta `numero`: el servidor fija torre
 * "UNICA" y piso "0". En tipo A `piso` es obligatorio y `torre` opcional.
 */
export interface CrearUnidadDto {
  numero: string;
  piso?: string;
  torre?: string;
}

export const TORRE_UNICA = 'UNICA';

/** Mismo texto que arma ms-condominios para la solicitud del residente. */
export function describirUnidad(tipo: string, unidad: Pick<Unidad, 'torre' | 'piso' | 'numero'>): string {
  if (tipo === 'B') return `Casa ${unidad.numero}`;
  const partes = unidad.torre === TORRE_UNICA ? [] : [`Torre ${unidad.torre}`];
  return [...partes, `Piso ${unidad.piso}`, `Unidad ${unidad.numero}`].join(' · ');
}
