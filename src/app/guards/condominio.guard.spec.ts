import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { firstValueFrom, isObservable, of, tap } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CondominiosService } from '../services/condominios.service';
import { condominioGuard } from './condominio.guard';

const CONDOMINIO = { id: 1, nombre: 'Condominio de prueba' };

describe('condominioGuard', () => {
  let activo: unknown;
  let lista: unknown[];
  let mockCondominios: {
    condominioActivo: ReturnType<typeof vi.fn>;
    condominios: ReturnType<typeof vi.fn>;
    cargarCondominios: ReturnType<typeof vi.fn>;
  };
  let mockMsal: {
    instance: {
      getActiveAccount: ReturnType<typeof vi.fn>;
      getAllAccounts: ReturnType<typeof vi.fn>;
    };
  };
  let mockRouter: { createUrlTree: ReturnType<typeof vi.fn> };

  const comoRol = (roles: string[]) =>
    mockMsal.instance.getActiveAccount.mockReturnValue({
      username: 'u@convivo.cl',
      idTokenClaims: { roles },
    });

  const ejecutar = async () => {
    const resultado = TestBed.runInInjectionContext(() =>
      condominioGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );
    return isObservable(resultado) ? firstValueFrom(resultado) : resultado;
  };

  beforeEach(() => {
    activo = null;
    lista = [];
    mockCondominios = {
      condominioActivo: vi.fn(() => activo),
      condominios: vi.fn(() => lista),
      cargarCondominios: vi.fn(() => of([]).pipe(tap(() => undefined))),
    };
    mockMsal = { instance: { getActiveAccount: vi.fn(), getAllAccounts: vi.fn(() => []) } };
    mockRouter = {
      createUrlTree: vi.fn((commands: string[]) => ({ commands }) as unknown as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CondominiosService, useValue: mockCondominios },
        { provide: MsalService, useValue: mockMsal },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('permite el acceso si ya hay un condominio activo, sin cargar la lista', async () => {
    activo = CONDOMINIO;

    expect(await ejecutar()).toBe(true);
    expect(mockCondominios.cargarCondominios).not.toHaveBeenCalled();
  });

  it('permite el acceso si al cargar la lista se restaura el condominio activo', async () => {
    comoRol(['administrador']);
    mockCondominios.cargarCondominios.mockImplementation(() =>
      of([CONDOMINIO]).pipe(tap(() => (activo = CONDOMINIO))),
    );

    expect(await ejecutar()).toBe(true);
    expect(mockCondominios.cargarCondominios).toHaveBeenCalledTimes(1);
  });

  it('manda al admin a /condominios si tras cargar no hay condominio activo', async () => {
    comoRol(['administrador']);

    expect(await ejecutar()).toEqual({ commands: ['/condominios'] });
  });

  it('acepta el alias admin como administrador', async () => {
    comoRol(['admin']);

    expect(await ejecutar()).toEqual({ commands: ['/condominios'] });
  });

  it('manda a un rol no admin a /sin-condominio, no a /condominios (evita el bucle)', async () => {
    comoRol(['conserje']);

    expect(await ejecutar()).toEqual({ commands: ['/sin-condominio'] });
    expect(mockRouter.createUrlTree).not.toHaveBeenCalledWith(['/condominios']);
  });

  it('manda a /sin-condominio si no hay sesión ni roles (falla cerrado)', async () => {
    mockMsal.instance.getActiveAccount.mockReturnValue(null);

    expect(await ejecutar()).toEqual({ commands: ['/sin-condominio'] });
  });

  it('no vuelve a cargar la lista si ya estaba cargada y no hay condominio activo', async () => {
    comoRol(['administrador']);
    lista = [CONDOMINIO];

    expect(await ejecutar()).toEqual({ commands: ['/condominios'] });
    expect(mockCondominios.cargarCondominios).not.toHaveBeenCalled();
  });
});
