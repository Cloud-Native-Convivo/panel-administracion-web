import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { roleGuard } from './role.guard';

describe('roleGuard (RBAC)', () => {
  let mockMsal: {
    instance: {
      getActiveAccount: ReturnType<typeof vi.fn>;
      getAllAccounts: ReturnType<typeof vi.fn>;
    };
  };
  let mockRouter: {
    createUrlTree: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMsal = {
      instance: {
        getActiveAccount: vi.fn(),
        getAllAccounts: vi.fn(),
      },
    };
    mockRouter = {
      createUrlTree: vi.fn((commands: string[]) => ({ commands } as unknown as UrlTree)),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: MsalService, useValue: mockMsal },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('permite acceso si la ruta no exige roles en data.roles', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'user@convivo.cl',
      idTokenClaims: {},
    });

    const route = { data: {} } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));
    expect(result).toBe(true);
  });

  it('permite acceso si el usuario posee al menos un rol requerido', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'admin@convivo.cl',
      idTokenClaims: {
        roles: ['admin'],
      },
    });

    const route = {
      data: { roles: ['administrador', 'comite'] },
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));
    expect(result).toBe(true);
  });

  it('bloquea acceso y redirige a /dashboard si el rol del usuario no coincide', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'conserje@convivo.cl',
      idTokenClaims: {
        roles: ['conserje'],
      },
    });

    const route = {
      data: { roles: ['administrador', 'comite'] },
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toEqual({ commands: ['/dashboard'] });
  });

  it('bloquea acceso y redirige a /dashboard si no tiene claim roles (Fail-Closed)', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'sin-roles@convivo.cl',
      idTokenClaims: {},
    });

    const route = {
      data: { roles: ['administrador'] },
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/dashboard']);
    expect(result).toEqual({ commands: ['/dashboard'] });
  });

  it('bloquea acceso y redirige a /login si no hay sesion activa', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue(null);
    mockMsal.instance.getAllAccounts.mockReturnValue([]);

    const route = {
      data: { roles: ['administrador'] },
    } as unknown as ActivatedRouteSnapshot;

    const result = TestBed.runInInjectionContext(() => roleGuard(route, {} as never));
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ commands: ['/login'] });
  });
});
