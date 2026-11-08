import { Route } from '@angular/router';
import { describe, it, expect } from 'vitest';
import { routes } from './app.routes';
import { roleGuard } from './guards/role.guard';

/** Rutas del Shell que a propósito no llevan roleGuard (destino de rechazo del propio guard). */
const SIN_ROLE_GUARD = ['sin-acceso'];

const hijosDelShell: Route[] = (routes.find((r) => r.children)?.children ?? []).filter(
  (r) => r.path && !r.redirectTo,
);

const tieneRoleGuard = (r: Route) => !!r.canActivate?.includes(roleGuard);

describe('rutas del Shell', () => {
  it('encuentra las rutas hijas del Shell', () => {
    expect(hijosDelShell.map((r) => r.path)).toContain('dashboard');
  });

  it.each(hijosDelShell.filter((r) => !SIN_ROLE_GUARD.includes(r.path!)))(
    '$path lleva roleGuard y data.roles no vacío',
    (ruta) => {
      expect(tieneRoleGuard(ruta)).toBe(true);
      expect((ruta.data?.['roles'] as string[] | undefined)?.length).toBeGreaterThan(0);
    },
  );

  it('dashboard y sin-condominio aceptan los roles del panel y rechazan a /sin-acceso', () => {
    for (const path of ['dashboard', 'sin-condominio']) {
      const ruta = hijosDelShell.find((r) => r.path === path)!;
      expect(ruta.data?.['roles']).toEqual(['administrador', 'admin', 'conserje', 'comite']);
      expect(ruta.data?.['redirectTo']).toBe('/sin-acceso');
    }
  });

  it('todo redirectTo apunta a una ruta del Shell sin roleGuard (evita bucles)', () => {
    const destinos = hijosDelShell
      .map((r) => r.data?.['redirectTo'] as string | undefined)
      .filter((d): d is string => !!d);
    expect(destinos.length).toBeGreaterThan(0);
    for (const destino of destinos) {
      const ruta = hijosDelShell.find((r) => '/' + r.path === destino);
      expect(ruta, `no existe la ruta ${destino}`).toBeDefined();
      expect(tieneRoleGuard(ruta!)).toBe(false);
    }
  });
});
