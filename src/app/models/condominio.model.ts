export interface Condominio {
  id: number;
  nombre: string;
  direccion: string;
  tipo: string; // 'A' o 'B'
  cantidad_sectores: number;
  plan: string;
  registro_minvu: string | null;
  seguro_incendio: boolean | number;
  plan_emergencia: boolean | number;
}
