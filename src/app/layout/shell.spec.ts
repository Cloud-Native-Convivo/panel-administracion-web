import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { signal } from '@angular/core';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NAV_ITEMS, Shell } from './shell';
import { CondominiosService } from '../services/condominios.service';

describe('Shell Navigation Items & RBAC', () => {
  let mockMsal: {
    instance: {
      getActiveAccount: ReturnType<typeof vi.fn>;
      getAllAccounts: ReturnType<typeof vi.fn>;
      logoutRedirect: ReturnType<typeof vi.fn>;
    };
  };
  let mockRouter: {
    url: string;
    navigate: ReturnType<typeof vi.fn>;
  };
  let mockCondominiosService: {
    condominioActivo: ReturnType<typeof signal>;
  };

  beforeEach(() => {
    mockMsal = {
      instance: {
        getActiveAccount: vi.fn(),
        getAllAccounts: vi.fn(),
        logoutRedirect: vi.fn(),
      },
    };
    mockRouter = {
      url: '/dashboard',
      navigate: vi.fn(),
    };
    mockCondominiosService = {
      condominioActivo: signal(null),
    };

    TestBed.configureTestingModule({
      providers: [
        Shell,
        { provide: MsalService, useValue: mockMsal },
        { provide: Router, useValue: mockRouter },
        { provide: CondominiosService, useValue: mockCondominiosService },
      ],
    });
  });

  it('expone condominios pero no rutas fuera de alcance (users)', () => {
    const ids = NAV_ITEMS.map((item) => item.id);
    expect(ids).toContain('condominios');
    expect(ids).not.toContain('users');
  });

  it('filtra gastos-comunes si el usuario no tiene rol administrador o comite', () => {
    mockCondominiosService.condominioActivo.set({ id: 1, nombre: 'Condominio Central' } as any);
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'conserje@convivo.cl',
      idTokenClaims: {
        roles: ['conserje'],
      },
    });

    const shell = TestBed.inject(Shell);
    const visibleIds = (shell as unknown as { navItems: () => typeof NAV_ITEMS }).navItems().map((i) => i.id);

    expect(visibleIds).toContain('dashboard');
    expect(visibleIds).toContain('condominios');
    expect(visibleIds).toContain('espacios');
    expect(visibleIds).not.toContain('gastos-comunes');
  });

  it('muestra gastos-comunes y espacios si el usuario tiene rol administrador', () => {
    mockCondominiosService.condominioActivo.set({ id: 1, nombre: 'Condominio Central' } as any);
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'admin@convivo.cl',
      idTokenClaims: {
        roles: ['administrador'],
      },
    });

    const shell = TestBed.inject(Shell);
    const visibleIds = (shell as unknown as { navItems: () => typeof NAV_ITEMS }).navItems().map((i) => i.id);

    expect(visibleIds).toContain('dashboard');
    expect(visibleIds).toContain('condominios');
    expect(visibleIds).toContain('espacios');
    expect(visibleIds).toContain('gastos-comunes');
  });

  it('oculta módulos restringidos si la cuenta no tiene roles (Fail-Closed)', () => {
    mockCondominiosService.condominioActivo.set({ id: 1, nombre: 'Condominio Central' } as any);
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'sin-roles@convivo.cl',
      idTokenClaims: {},
    });

    const shell = TestBed.inject(Shell);
    const visibleIds = (shell as unknown as { navItems: () => typeof NAV_ITEMS }).navItems().map((i) => i.id);

    expect(visibleIds).toEqual(['dashboard', 'condominios']);
  });
});
