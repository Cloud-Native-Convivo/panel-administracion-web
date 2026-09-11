/** Formato de moneda CLP compartido por dashboard y pantallas de gastos comunes. */
export function formatoMonto(monto: number): string {
  return monto.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}
