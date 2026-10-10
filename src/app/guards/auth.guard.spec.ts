import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
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

  it('permite el acceso si existe una cuenta activa', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue({ username: 'admin@convivo.cl' });
    mockMsal.instance.getAllAccounts.mockReturnValue([]);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
    expect(result).toBe(true);
  });

  it('permite el acceso si getAllAccounts contiene cuentas', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue(null);
    mockMsal.instance.getAllAccounts.mockReturnValue([{ username: 'admin@convivo.cl' }]);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
    expect(result).toBe(true);
  });

  it('redirige a /login cuando no hay cuentas autenticadas', () => {
    mockMsal.instance.getActiveAccount.mockReturnValue(null);
    mockMsal.instance.getAllAccounts.mockReturnValue([]);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, {} as never),
    );
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ commands: ['/login'] });
  });
});
