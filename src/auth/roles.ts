import type { AccountInfo } from '@azure/msal-browser';

/**
 * Roles de negocio Convivo, en el mismo formato que usan el BFF y
 * ms-gastos-comunes.
 */
export type RolConvivo =
  'administrador' | 'admin' | 'conserje' | 'comite' | 'propietario' | 'residente';

const ROLES_VALIDOS: readonly RolConvivo[] = [
  'administrador',
  'admin',
  'conserje',
  'comite',
  'propietario',
  'residente',
];

/**
 * Lee los roles de negocio del ID token de la cuenta activa en Microsoft Entra ID.
 * Claim por defecto: `roles`.
 *
 * Principio Fail-Closed (OWASP A01 / security-audit):
 * Si la cuenta no posee claim de roles o no tiene sesión activa, devuelve siempre `[]`.
 * La seguridad en la UI es defensa en profundidad; el backend valida criptográficamente.
 */
export function rolesDeCuenta(cuenta: AccountInfo | null, claim = 'roles'): RolConvivo[] {
  if (!cuenta?.idTokenClaims) {
    return [];
  }

  const raw = (cuenta.idTokenClaims as Record<string, unknown>)[claim];
  const valores = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === 'string'
      ? raw.split(',')
      : [];

  return valores
    .map((v) => v.trim().toLowerCase())
    .map((v) => (v === 'admin' ? 'administrador' : v))
    .filter((v): v is RolConvivo => (ROLES_VALIDOS as string[]).includes(v));
}
