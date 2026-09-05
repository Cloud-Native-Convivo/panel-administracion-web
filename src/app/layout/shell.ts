import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import {
  Home, Users, Building2, Search, Calendar, Settings,
  DollarSign, MessageSquare, Camera, Target, Bell, Lock, LogOut,
  Menu, X,
} from 'lucide-angular';

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

  protected readonly isMobileMenuOpen = signal(false);

  protected readonly navItems = NAV_ITEMS;
  protected readonly soonItems = SOON_ITEMS;

  // Iconos sueltos usados en el template
  protected readonly icBuilding = Building2;
  protected readonly icLock = Lock;
  protected readonly icSearch = Search;
  protected readonly icLogout = LogOut;
  protected readonly icMenu = Menu;
  protected readonly icX = X;

  // Segmento actual de la ruta ('dashboard', 'users', ...)
  protected get current(): string {
    return this.router.url.split('/')[1] || 'dashboard';
  }

  protected get title(): string {
    return PAGE_TITLES[this.current] ?? '';
  }

  protected isActive(id: string): boolean {
    return this.current === id;
  }

  protected toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  protected closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  protected go(id: string): void {
    this.closeMobileMenu();
    this.router.navigate(['/', id]);
  }

  protected logout(): void {
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }
}
