import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import type { LucideIconData } from 'lucide-angular';
import {
  Home, Users, Building2, Search, Calendar, Settings,
  DollarSign, MessageSquare, Camera, Target, Bell, Lock, LogOut,
  Menu, X, List,
} from 'lucide-angular';
import { MsalService } from '@azure/msal-angular';
import { CondominiosService } from '../services/condominios.service';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIconData;
  requiresCondominio?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',      label: 'Inicio',           icon: Home },
  { id: 'espacios',       label: 'Espacios comunes', icon: Search,     requiresCondominio: false },
  { id: 'gastos-comunes', label: 'Gastos comunes',   icon: DollarSign, requiresCondominio: false },
];

// Usuarios, Condominios y Unidades quedan en "Próximamente" (fuera de alcance MVP)
export const SOON_ITEMS: NavItem[] = [
  { id: '', label: 'Mis Condominios',  icon: List           },
  { id: '', label: 'Usuarios',         icon: Users          },
  { id: '', label: 'Unidades',         icon: Building2      },
  { id: '', label: 'Reservas',         icon: Calendar       },
  { id: '', label: 'Configuración',    icon: Settings       },
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
  'gastos-comunes': 'Gastos comunes',
  config:      'Configuración de cuenta',
};

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, LucideAngularModule],
  templateUrl: './shell.html',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly msalService = inject(MsalService);
  private readonly condominiosService = inject(CondominiosService);

  protected readonly isMobileMenuOpen = signal(false);

  protected readonly navItems = computed(() => {
    const hasActive = !!this.condominiosService.condominioActivo();
    return NAV_ITEMS.filter(item => !item.requiresCondominio || hasActive);
  });
  
  protected readonly soonItems = SOON_ITEMS;
  protected readonly hasActiveCondominio = computed(() => !!this.condominiosService.condominioActivo());

  private get cuenta() {
    return this.msalService.instance.getActiveAccount();
  }

  protected get nombreUsuario(): string {
    return this.cuenta?.name ?? this.cuenta?.username ?? 'Usuario Convivo';
  }

  protected get correoUsuario(): string {
    return this.cuenta?.username ?? '';
  }

  protected get inicialesUsuario(): string {
    const partes = this.nombreUsuario.trim().split(/\s+/).filter(Boolean);
    const iniciales = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '');
    return iniciales.join('') || 'U';
  }

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
    this.msalService.logoutRedirect();
  }
}
