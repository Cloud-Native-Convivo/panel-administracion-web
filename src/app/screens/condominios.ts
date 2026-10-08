import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Building2, AlertCircle, Plus, ChevronRight, ChevronDown, X, Edit2, Home, Map, ShieldCheck, FileText, ClipboardList } from 'lucide-angular';
import { TORRES, SECTORES_B, CONDOMINIO_INFO } from '../data/sample-data';
import type { UnitEntry } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';
import { CondominiosService } from '../services/condominios.service';

@Component({
  selector: 'app-condominios',
  imports: [LucideAngularModule, StatusBadge, FormsModule],
  templateUrl: './condominios.html',
})
export class Condominios implements OnInit {
  private condominiosService = inject(CondominiosService);
  
  protected readonly isModalOpen = signal(false);
  protected readonly formData = signal({
    nombre: '', direccion: '', tipo: 'A', cantidad_sectores: 1, plan: 'basico',
    registro_minvu: '', seguro_incendio: false, plan_emergencia: false
  });

  ngOnInit() {
    this.condominiosService.loadCondominios();
  }

  protected readonly listaCondominios = this.condominiosService.condominios;
  
  protected readonly info = computed(() => {
    const apiData = this.condominiosService.condominioActivo();
    if (apiData) {
      return {
        nombre: apiData.nombre,
        direccion: apiData.direccion,
        registro_minvu: apiData.registro_minvu,
        seguro_incendio: !!apiData.seguro_incendio,
        plan_emergencia: !!apiData.plan_emergencia,
        tipo: apiData.tipo
      };
    }
    return null; // Si no hay seleccionado, devuelve null
  });

  protected seleccionar(c: any) {
    this.condominiosService.seleccionar(c);
  }

  protected guardarNuevo() {
    this.condominiosService.crearCondominio(this.formData());
    this.isModalOpen.set(false);
  }

  // Reemplazar señal manual tipoVista por un computed basado en el backend
  protected readonly tipoVista = computed(() => this.info()?.tipo || 'A');
  
  protected readonly torres = computed(() => this.tipoVista() === 'A' ? TORRES : SECTORES_B);

  
  protected readonly icHome = Home;
  protected readonly icMap = Map;
  protected readonly icShieldCheck = ShieldCheck;
  protected readonly icFileText = FileText;
  protected readonly icClipboardList = ClipboardList;
  protected readonly icBuilding = Building2;
  protected readonly icAlert = AlertCircle;
  protected readonly icPlus = Plus;
  protected readonly icChevronRight = ChevronRight;
  protected readonly icChevronDown = ChevronDown;
  protected readonly icX = X;
  protected readonly icEdit = Edit2;

  protected readonly expanded = signal<Set<string>>(new Set(['A', 'B']));
  protected readonly selectedUnit = signal<UnitEntry | null>(null);
  protected readonly selectedTorre = signal('');

  protected readonly totalMorosos = computed(
    () => this.torres().flatMap(t => t.units).filter(u => u.moroso).length,
  );

  protected toggle(id: string): void {
    this.expanded.update(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  protected morososDe(torreId: string): number {
    return this.torres().find(t => t.id === torreId)!.units.filter(u => u.moroso).length;
  }

  protected selectUnit(unit: UnitEntry, torreName: string): void {
    this.selectedUnit.set(unit);
    this.selectedTorre.set(torreName);
  }
}
