import type { AccountInfo } from '@azure/msal-browser';

/**
 * Roles de negocio Convivo, en el mismo formato que usan el BFF y
 * ms-gastos-comunes.
 */
export type RolConvivo = 'administrador' | 'conserje' | 'comite' | 'propietario' | 'residente';

const ROLES_VALIDOS: readonly RolConvivo[] = ['administrador', 'conserje', 'comite', 'propietario', 'residente'];

/**
 * Lee, de forma best-effort, los roles de negocio del ID token de la
 * cuenta activa. Claim por defecto: `roles`.
 *
 * IMPORTANTE: el App Role / claim de rol definitivo todavía NO está
 * registrado en Entra ID — hasta que se registre, esto normalmente
 * devuelve `[]` aunque la cuenta sea válida. Úsalo solo para
 * mostrar/ocultar atajos de UI, nunca como control de acceso real: la
 * autorización de verdad la hace el backend.
 */
export function rolesDeCuenta(cuenta: AccountInfo | null, claim = 'roles'): RolConvivo[] {
  const raw = cuenta?.idTokenClaims?.[claim as keyof typeof cuenta.idTokenClaims];
  const valores = Array.isArray(raw)
    ? raw.map(String)
    : typeof raw === 'string'
      ? raw.split(',')
      : [];

  return valores
    .map((v) => v.trim().toLowerCase())
    .filter((v): v is RolConvivo => (ROLES_VALIDOS as string[]).includes(v));
}
