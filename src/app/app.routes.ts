import { Routes } from '@angular/router';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./screens/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./screens/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'users',
        loadComponent: () => import('./screens/users').then((m) => m.Users),
      },
      {
        path: 'condominios',
        loadComponent: () => import('./screens/condominios').then((m) => m.Condominios),
      },
      {
        path: 'espacios',
        loadComponent: () => import('./screens/espacios').then((m) => m.Espacios),
      },
      {
        path: 'reservas',
        loadComponent: () => import('./screens/reservas').then((m) => m.Reservas),
      },
      {
        path: 'config',
        loadComponent: () => import('./screens/config').then((m) => m.Config),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
