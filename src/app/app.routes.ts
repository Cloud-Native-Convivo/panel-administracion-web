import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { condominioGuard } from './guards/condominio.guard';
import type { RolConvivo } from '../auth/roles';

const ROLES_PANEL: RolConvivo[] = ['administrador', 'admin', 'conserje', 'comite'];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./screens/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        canActivate: [roleGuard, condominioGuard],
        data: { roles: ROLES_PANEL, redirectTo: '/sin-acceso' },
        loadComponent: () => import('./screens/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'sin-condominio',
        canActivate: [roleGuard],
        data: { roles: ROLES_PANEL, redirectTo: '/sin-acceso' },
        loadComponent: () => import('./screens/sin-condominio').then((m) => m.SinCondominio),
      },
      {
        // Destino de rechazo del roleGuard: solo authGuard (heredado del Shell), sin roleGuard.
        path: 'sin-acceso',
        loadComponent: () => import('./screens/sin-acceso').then((m) => m.SinAcceso),
      },
      {
        path: 'condominios',
        canActivate: [roleGuard],
        data: { roles: ['administrador', 'admin'] },
        loadComponent: () => import('./screens/condominios').then((m) => m.Condominios),
      },
      {
        path: 'espacios',
        canActivate: [roleGuard, condominioGuard],
        data: { roles: ['administrador', 'admin', 'conserje', 'comite'] },
        loadComponent: () => import('./screens/espacios').then((m) => m.Espacios),
      },
      {
        path: 'reservas',
        canActivate: [roleGuard, condominioGuard],
        data: { roles: ['administrador', 'admin', 'conserje', 'comite'] },
        loadComponent: () => import('./screens/reservas').then((m) => m.Reservas),
      },
      {
        path: 'gastos-comunes',
        canActivate: [roleGuard, condominioGuard],
        data: { roles: ['administrador', 'admin', 'comite'] },
        loadComponent: () => import('./screens/gastos-comunes').then((m) => m.GastosComunes),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
