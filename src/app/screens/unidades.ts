import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { LucideAngularModule, AlertCircle, CheckCircle2, Plus, RefreshCw, X } from 'lucide-angular';
import { CondominiosService } from '../services/condominios.service';
import { UnidadesService } from '../services/unidades.service';
import { CrearUnidadDto, Unidad, describirUnidad } from '../models/unidad.model';

/**
 * Carga de unidades del condominio activo. El formulario sigue la regla de
 * Ley 21.442 que valida ms-condominios: en tipo B (casas) solo el número; en
 * tipo A piso obligatorio y torre opcional. El servidor es quien decide: el
 * formulario solo evita enviar lo que se sabe que va a rechazar.
 */
@Component({
  selector: 'app-unidades',
  imports: [LucideAngularModule],
  templateUrl: './unidades.html',
})
export class Unidades implements OnInit {
  private readonly unidadesService = inject(UnidadesService);
  private readonly condominiosService = inject(CondominiosService);

  protected readonly condominio = computed(() => this.condominiosService.condominioActivo()!);
  protected readonly esCasas = computed(() => this.condominio().tipo === 'B');

  protected readonly unidades = signal<Unidad[]>([]);
  protected readonly cargando = signal(true);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly mostrarInactivas = signal(false);

  protected readonly torre = signal('');
  protected readonly piso = signal('');
  protected readonly numero = signal('');
  protected readonly guardando = signal(false);
  protected readonly errorForm = signal<string | null>(null);

  protected readonly cambiandoId = signal<number | null>(null);
  protected readonly feedback = signal<{ tipo: 'exito' | 'error'; mensaje: string } | null>(null);

  protected readonly icPlus = Plus;
  protected readonly icRefresh = RefreshCw;
  protected readonly icAlert = AlertCircle;
  protected readonly icCheckCircle = CheckCircle2;
  protected readonly icX = X;

  ngOnInit(): void {
    this.cargar();
  }

  protected descripcion(unidad: Unidad): string {
    return describirUnidad(this.condominio().tipo, unidad);
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.errorCarga.set(null);
    this.unidadesService.listar(this.condominio().id, this.mostrarInactivas()).subscribe({
      next: (lista) => {
        this.unidades.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        this.errorCarga.set(this.mensajeError(err, 'No se pudieron cargar las unidades.'));
        this.cargando.set(false);
      },
    });
  }

  protected cambiarFiltroInactivas(valor: boolean): void {
    this.mostrarInactivas.set(valor);
    this.cargar();
  }

  protected crear(evento: Event): void {
    evento.preventDefault();
    const numero = this.numero().trim();
    const piso = this.piso().trim();
    const torre = this.torre().trim();
    if (!numero) {
      this.errorForm.set(
        this.esCasas() ? 'Indica el número de la casa.' : 'Indica el número del departamento.',
      );
      return;
    }
    if (!this.esCasas() && !piso) {
      this.errorForm.set('Indica el piso del departamento.');
      return;
    }
    const dto: CrearUnidadDto = this.esCasas()
      ? { numero }
      : { numero, piso, ...(torre ? { torre } : {}) };

    this.guardando.set(true);
    this.errorForm.set(null);
    this.unidadesService.crear(this.condominio().id, dto).subscribe({
      next: (unidad) => {
        this.unidades.update((lista) => [...lista, unidad]);
        this.numero.set('');
        this.piso.set('');
        this.torre.set('');
        this.guardando.set(false);
        this.mostrarFeedback('exito', `${this.descripcion(unidad)} agregada.`);
      },
      error: (err) => {
        this.errorForm.set(this.mensajeError(err, 'No se pudo agregar la unidad.'));
        this.guardando.set(false);
      },
    });
  }

  protected cambiarActiva(unidad: Unidad): void {
    this.cambiandoId.set(unidad.id);
    this.unidadesService.cambiarActiva(this.condominio().id, unidad.id, !unidad.activa).subscribe({
      next: (actualizada) => {
        this.unidades.update((lista) =>
          !actualizada.activa && !this.mostrarInactivas()
            ? lista.filter((u) => u.id !== actualizada.id)
            : lista.map((u) => (u.id === actualizada.id ? actualizada : u)),
        );
        this.cambiandoId.set(null);
        const accion = actualizada.activa ? 'activada' : 'desactivada';
        this.mostrarFeedback('exito', `${this.descripcion(actualizada)} ${accion}.`);
      },
      error: (err) => {
        this.cambiandoId.set(null);
        this.mostrarFeedback(
          'error',
          this.mensajeError(err, 'No se pudo cambiar el estado de la unidad.'),
        );
      },
    });
  }

  protected cerrarFeedback(): void {
    this.feedback.set(null);
  }

  private mostrarFeedback(tipo: 'exito' | 'error', mensaje: string): void {
    this.feedback.set({ tipo, mensaje });
    setTimeout(() => this.feedback.set(null), 5000);
  }

  /** ms-condominios responde sus 404/409/422 propios con `message`; Pydantic usa `detail` (lista). */
  private mensajeError(err: unknown, porDefecto: string): string {
    const status = (err as { status?: number })?.status;
    const cuerpo = (err as { error?: { message?: unknown; detail?: unknown } })?.error;
    if (typeof cuerpo?.message === 'string') return cuerpo.message;
    if (typeof cuerpo?.detail === 'string') return cuerpo.detail;
    if (status === 0) return 'No se pudo conectar con el BFF.';
    if (status === 403) return 'Solo un administrador puede gestionar unidades.';
    if (status === 422) return 'Revisa los datos de la unidad.';
    return porDefecto;
  }
}
