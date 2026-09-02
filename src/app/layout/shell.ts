import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { LucideAngularModule } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import {
  Home, Users, Building2, Search, Calendar, Settings,
  DollarSign, MessageSquare, Camera, Target, Bell, Lock, LogOut,
} from 'lucide-angular';
import { environment } from '../../environments/environment';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIconData;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',   label: 'Inicio',          icon: Home      },
  { id: 'users',       label: 'Usuarios',        icon: Users     },
  { id: 'condominios', label: 'Unidades',        icon: Building2 },
  { id: 'espacios',    label: 'Espacios comunes',icon: Search    },
  { id: 'reservas',    label: 'Reservas',        icon: Calendar  },
  { id: 'config',      label: 'Configuración',   icon: Settings  },
];

const SOON_ITEMS: NavItem[] = [
  { id: '', label: 'Gastos comunes',   icon: DollarSign    },
  { id: '', label: 'Tablón de avisos', icon: MessageSquare },
  { id: '', label: 'Reg. fotográfico', icon: Camera        },
  { id: '', label: 'Incidentes',       icon: Target        },
  { id: '', label: 'Notificaciones',   icon: Bell          },
];

const PAGE_TITLES: Record<string, string> = {
  dashboard:   'Inicio',
  users:       'Usuarios y roles',
  condominios: 'Condominios y unidades',
  espacios:    'Espacios comunes',
  reservas:    'Reservas',
  config:      'Configuración de cuenta',
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly msal = inject(MsalService);

  protected readonly navItems = NAV_ITEMS;
  protected readonly soonItems = SOON_ITEMS;

  // Iconos sueltos usados en el template
  protected readonly icBuilding = Building2;
  protected readonly icLock = Lock;
  protected readonly icSearch = Search;
  protected readonly icLogout = LogOut;

  // Segmento actual de la ruta ('dashboard', 'users', ...)
  protected get current(): string {
    return this.router.url.split('/')[1] || 'dashboard';
  }

  protected get title(): string {
    return PAGE_TITLES[this.current] ?? '';
  }

  protected get user(): { name: string; role: string; initials: string } {
    const account = this.msal.instance.getAllAccounts()[0];
    if (account?.name) {
      const initials = account.name.split(/\s+/).map(p => p[0]).join('').toUpperCase();
      return { name: account.name, role: 'Administrador', initials };
    }
    return { name: 'Jorge Morales D.', role: 'Administrador', initials: 'JM' };
  }

  protected isActive(id: string): boolean {
    return this.current === id;
  }

  protected go(id: string): void {
    this.router.navigate(['/', id]);
  }

  protected logout(): void {
    this.msal
      .logoutRedirect({
        postLogoutRedirectUri: environment.redirectUri,
      })
      .subscribe();
  }
}
