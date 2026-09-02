import { Routes } from '@angular/router';
import { Shell } from './layout/shell';
import { authGuard } from './auth.guard';
import { Login } from './screens/login';
import { Dashboard } from './screens/dashboard';
import { Users } from './screens/users';
import { Condominios } from './screens/condominios';
import { Espacios } from './screens/espacios';
import { Reservas } from './screens/reservas';
import { Config } from './screens/config';

export const routes: Routes = [
  { path: 'login', component: Login },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'users', component: Users },
      { path: 'condominios', component: Condominios },
      { path: 'espacios', component: Espacios },
      { path: 'reservas', component: Reservas },
      { path: 'config', component: Config },
    ],
  },
  { path: '**', redirectTo: '' },
];
