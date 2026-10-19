import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Building2, AlertCircle, Plus, ChevronRight, ChevronDown, X, Edit2, Trash2, Home, Map, ShieldCheck, FileText, ClipboardList } from 'lucide-angular';
import { forkJoin } from 'rxjs';
import { TORRES, SECTORES_B, CONDOMINIO_INFO } from '../data/sample-data';
import type { UnitEntry } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';
import { ModalDialog } from '../shared/modal-dialog';
import { CondominiosService, type SolicitudAsignacion } from '../services/condominios.service';
import { EspaciosService } from '../services/espacios.service';
import { GastosComunesService } from '../services/gastos-comunes.service';
import { Condominio } from '../models/condominio.model';

@Component({
  selector: 'app-condominios',
  imports: [LucideAngularModule, StatusBadge, FormsModule, ModalDialog],
  templateUrl: './condominios.html',
})
export class Condominios implements OnInit {
  private condominiosService = inject(CondominiosService);
  private espaciosService = inject(EspaciosService);
  private gastosComunesService = inject(GastosComunesService);

  protected readonly isModalOpen = signal(false);
  protected readonly modoEdicion = signal(false);
  protected readonly condominioEditando = signal<Condominio | null>(null);
  protected readonly formData = signal({
    nombre: '', direccion: '', tipo: 'A', cantidad_sectores: 1, plan: 'basico',
    registro_minvu: '', seguro_incendio: false, plan_emergencia: false
  });

  protected readonly modalEliminarVisible = signal(false);
  protected readonly condominioAEliminar = signal<Condominio | null>(null);
  protected readonly cargandoConteoAsociados = signal(false);
  protected readonly conteoAsociados = signal<{ espacios: number; gastos: number } | null>(null);

  ngOnInit() {
    this.condominiosService.loadCondominios();
    this.cargarSolicitudes();
  }

  protected readonly solicitudes = signal<SolicitudAsignacion[]>([]);
  protected readonly errorSolicitudes = signal<string | null>(null);

  protected cargarSolicitudes(): void {
    this.condominiosService.listarSolicitudes().subscribe({
      next: (solicitudes) => this.solicitudes.set(solicitudes),
      error: () => this.errorSolicitudes.set('No se pudieron cargar las solicitudes.'),
    });
  }

  protected aprobarSolicitud(id: number): void {
    this.condominiosService.aprobarSolicitud(id).subscribe({
      next: () => this.solicitudes.update((lista) => lista.filter((solicitud) => solicitud.id !== id)),
      error: () => this.errorSolicitudes.set('No se pudo aprobar la solicitud.'),
    });
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

  protected abrirModalCrear(): void {
    this.formData.set({
      nombre: '', direccion: '', tipo: 'A', cantidad_sectores: 1, plan: 'basico',
      registro_minvu: '', seguro_incendio: false, plan_emergencia: false
    });
    this.modoEdicion.set(false);
    this.condominioEditando.set(null);
    this.condominiosService.error.set(null);
    this.isModalOpen.set(true);
  }

  protected abrirModalEditar(c: Condominio): void {
    this.formData.set({
      nombre: c.nombre,
      direccion: c.direccion,
      tipo: c.tipo,
      cantidad_sectores: c.cantidad_sectores,
      plan: c.plan,
      registro_minvu: c.registro_minvu ?? '',
      seguro_incendio: !!c.seguro_incendio,
      plan_emergencia: !!c.plan_emergencia,
    });
    this.modoEdicion.set(true);
    this.condominioEditando.set(c);
    this.condominiosService.error.set(null);
    this.isModalOpen.set(true);
  }

  protected readonly errorGuardado = this.condominiosService.error;

  protected guardarNuevo() {
    const peticion = this.modoEdicion()
      ? (() => {
          const actual = this.condominioEditando();
          return actual ? this.condominiosService.actualizarCondominio(actual.id, this.formData()) : null;
        })()
      : this.condominiosService.crearCondominio(this.formData());

    if (!peticion) return;

    peticion.subscribe((resultado) => {
      if (resultado) {
        this.isModalOpen.set(false);
        this.modoEdicion.set(false);
        this.condominioEditando.set(null);
      }
      // Si resultado es null, el error ya quedo en errorGuardado() y el modal sigue abierto.
    });
  }

  protected abrirModalEliminar(c: Condominio): void {
    this.condominioAEliminar.set(c);
    this.conteoAsociados.set(null);
    this.condominiosService.error.set(null);
    this.modalEliminarVisible.set(true);
    this.cargandoConteoAsociados.set(true);
    forkJoin({
      espacios: this.espaciosService.listar(c.id),
      gastos: this.gastosComunesService.listar(String(c.id)),
    }).subscribe({
      next: ({ espacios, gastos }) => {
        this.conteoAsociados.set({ espacios: espacios.length, gastos: gastos.content.length });
        this.cargandoConteoAsociados.set(false);
      },
      // Si no se puede consultar (microservicio caído, etc.), no bloquea el
      // borrado: solo se omite el conteo y queda la advertencia genérica.
      error: () => this.cargandoConteoAsociados.set(false),
    });
  }

  protected cerrarModalEliminar(): void {
    this.modalEliminarVisible.set(false);
    this.condominioAEliminar.set(null);
    this.conteoAsociados.set(null);
  }

  protected confirmarEliminar(): void {
    const c = this.condominioAEliminar();
    if (!c) return;
    this.condominiosService.eliminarCondominio(c.id).subscribe((exito) => {
      if (exito) {
        this.cerrarModalEliminar();
      }
      // Si no, el error ya quedo en errorGuardado() y el modal sigue abierto.
    });
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
  protected readonly icTrash = Trash2;

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
