import { describe, expect, it } from 'vitest';
import type { AccountInfo } from '@azure/msal-browser';
import { rolesDeCuenta } from './roles';

describe('rolesDeCuenta (Fail-Closed)', () => {
  it('extrae y normaliza roles de administrador desde array', () => {
    const cuenta: Partial<AccountInfo> = {
      idTokenClaims: {
        roles: ['admin'],
      },
    };

    const roles = rolesDeCuenta(cuenta as AccountInfo);
    expect(roles).toEqual(['administrador']);
  });

  it('extrae multiples roles validos desde array', () => {
    const cuenta: Partial<AccountInfo> = {
      idTokenClaims: {
        roles: ['administrador', 'conserje'],
      },
    };

    const roles = rolesDeCuenta(cuenta as AccountInfo);
    expect(roles).toEqual(['administrador', 'conserje']);
  });

  it('extrae roles desde formato string separado por comas', () => {
    const cuenta: Partial<AccountInfo> = {
      idTokenClaims: {
        roles: 'comite, conserje' as unknown as string[],
      },
    };

    const roles = rolesDeCuenta(cuenta as AccountInfo);
    expect(roles).toEqual(['comite', 'conserje']);
  });

  it('retorna array vacio si idTokenClaims no contiene el claim roles (Fail-Closed)', () => {
    const cuenta: Partial<AccountInfo> = {
      idTokenClaims: {
        name: 'Juan Perez',
      },
    };

    const roles = rolesDeCuenta(cuenta as AccountInfo);
    expect(roles).toEqual([]);
  });

  it('retorna array vacio si cuenta es null (Fail-Closed)', () => {
    const roles = rolesDeCuenta(null);
    expect(roles).toEqual([]);
  });

  it('descarta roles no autorizados o desconocidos', () => {
    const cuenta: Partial<AccountInfo> = {
      idTokenClaims: {
        roles: ['superadmin', 'hacker', '<script>', ''],
      },
    };

    const roles = rolesDeCuenta(cuenta as AccountInfo);
    expect(roles).toEqual([]);
  });
});
