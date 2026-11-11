import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, finalize, of, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import {
  Plus,
  Users,
  Clock,
  X,
  Camera,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  MapPin,
  CheckCircle2,
} from 'lucide-angular';
import { StatusBadge } from '../shared/status-badge';
import { ModalDialog } from '../shared/modal-dialog';
import { EspaciosService } from '../services/espacios.service';
import { CondominiosService } from '../services/condominios.service';
import {
  Espacio,
  CrearEspacioDto,
  ActualizarEspacioDto,
  JobEspacio,
  Respuesta202,
} from '../models/espacio.model';
import { CurrencyPipe } from '@angular/common';

type AccionEspacio = 'crear' | 'editar' | 'eliminar';

const MENSAJE_SERVICIO_OCUPADO =
  'No se pudo enviar la solicitud: el servicio está ocupado. Intenta nuevamente en unos segundos.';
const MENSAJE_SIN_CONFIRMAR =
  'No se pudo confirmar el resultado de la solicitud. Revisa la lista en unos momentos.';

export interface FormularioEspacio {
  nombre: string;
  capacidad: number;
  tarifa_hora: number;
  ubicacion: string;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-espacios',
  standalone: true,
  imports: [LucideAngularModule, StatusBadge, FormsModule, ModalDialog, CurrencyPipe],
  templateUrl: './espacios.html',
})
export class Espacios implements OnInit {
  private readonly espaciosService = inject(EspaciosService);
  private readonly condominiosService = inject(CondominiosService);
  private readonly destroyRef = inject(DestroyRef);

  private get condominioId(): number {
    return this.condominiosService.condominioActivo()!.id;
  }

  // Estado reactivo principal
  protected readonly espacios = signal<Espacio[]>([]);
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly guardando = signal<boolean>(false);
  protected readonly eliminando = signal<boolean>(false);
  // Solicitudes aceptadas (202) cuyo resultado aún no se conoce: muestra el banner "Solicitud enviada".
  protected readonly solicitudesEnCurso = signal<number>(0);

  // Modales
  protected readonly modalFormVisible = signal<boolean>(false);
  protected readonly modoEdicion = signal<boolean>(false);
  protected readonly espacioEnEdicion = signal<Espacio | null>(null);

  protected readonly modalEliminarVisible = signal<boolean>(false);
  protected readonly espacioAEliminar = signal<Espacio | null>(null);
  protected readonly errorModalEliminar = signal<string | null>(null);

  // Feedback al usuario
  protected readonly feedback = signal<{
    tipo: 'exito' | 'error';
    mensaje: string;
  } | null>(null);
  protected readonly errorModal = signal<string | null>(null);

  // Formulario reactivo
  protected readonly formulario = signal<FormularioEspacio>({
    nombre: '',
    capacidad: 10,
    tarifa_hora: 0,
    ubicacion: '',
    descripcion: '',
    estado: 'activo',
  });

  // Iconos del template
  protected readonly icPlus = Plus;
  protected readonly icUsers = Users;
  protected readonly icClock = Clock;
  protected readonly icX = X;
  protected readonly icCamera = Camera;
  protected readonly icEdit = Edit2;
  protected readonly icTrash = Trash2;
  protected readonly icAlert = AlertCircle;
  protected readonly icRefresh = RefreshCw;
  protected readonly icDollar = DollarSign;
  protected readonly icMapPin = MapPin;
  protected readonly icCheck = CheckCircle2;

  ngOnInit(): void {
    this.cargarEspacios();
  }

  protected cargarEspacios(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.espaciosService.listar(this.condominioId).subscribe({
      next: (datos) => {
        this.espacios.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error cargando espacios comunes:', err);
        this.error.set(
          'No se pudo conectar con el microservicio de espacios comunes. Verifica que esté en ejecución en el puerto 8082.',
        );
        this.cargando.set(false);
      },
    });
  }

  protected abrirModalCrear(): void {
    this.formulario.set({
      nombre: '',
      capacidad: 10,
      tarifa_hora: 0,
      ubicacion: '',
      descripcion: '',
      estado: 'activo',
    });
    this.errorModal.set(null);
    this.modoEdicion.set(false);
    this.espacioEnEdicion.set(null);
    this.modalFormVisible.set(true);
  }

  protected abrirModalEditar(espacio: Espacio): void {
    this.formulario.set({
      nombre: espacio.nombre,
      capacidad: espacio.capacidad,
      tarifa_hora: espacio.tarifa_hora ?? 0,
      ubicacion: espacio.ubicacion ?? '',
      descripcion: espacio.descripcion ?? '',
      estado: espacio.estado || 'activo',
    });
    this.errorModal.set(null);
    this.modoEdicion.set(true);
    this.espacioEnEdicion.set(espacio);
    this.modalFormVisible.set(true);
  }

  protected cerrarModalForm(): void {
    this.modalFormVisible.set(false);
    this.modoEdicion.set(false);
    this.espacioEnEdicion.set(null);
    this.errorModal.set(null);
  }

  protected guardarEspacio(): void {
    const f = this.formulario();
    const nombre = f.nombre.trim();
    if (!nombre) {
      this.errorModal.set('El nombre del espacio es obligatorio.');
      return;
    }
    if (nombre.length > 100) {
      this.errorModal.set('El nombre no puede superar 100 caracteres.');
      return;
    }

    const capacidad = Number(f.capacidad);
    if (!capacidad || isNaN(capacidad) || capacidad <= 0 || capacidad > 5000) {
      this.errorModal.set('La capacidad debe ser un número entre 1 y 5000 personas.');
      return;
    }

    const tarifa_hora =
      f.tarifa_hora === null || f.tarifa_hora === undefined || isNaN(Number(f.tarifa_hora))
        ? 0
        : Number(f.tarifa_hora);
    if (tarifa_hora < 0 || tarifa_hora > 10000000) {
      this.errorModal.set('La tarifa por hora debe ser un valor entre $0 y $10.000.000.');
      return;
    }

    this.errorModal.set(null);
    this.guardando.set(true);

    if (this.modoEdicion()) {
      const actual = this.espacioEnEdicion();
      if (!actual) return;

      const dto: ActualizarEspacioDto = {
        nombre,
        capacidad: Math.floor(capacidad),
        tarifa_hora,
        ubicacion: f.ubicacion.trim() || null,
        descripcion: f.descripcion.trim() || null,
        estado: f.estado,
      };

      this.despachar(this.espaciosService.actualizar(actual.id, this.condominioId, dto), {
        accion: 'editar',
        nombre,
        alAceptar: () => {
          this.guardando.set(false);
          this.cerrarModalForm();
        },
        alRechazar: (mensaje) => {
          this.guardando.set(false);
          this.errorModal.set(mensaje ?? 'Error al actualizar el espacio común. Revisa la conexión.');
        },
      });
    } else {
      const dto: CrearEspacioDto = {
        condominio_id: this.condominioId,
        nombre,
        capacidad: Math.floor(capacidad),
        tarifa_hora,
        ubicacion: f.ubicacion.trim() || null,
        descripcion: f.descripcion.trim() || null,
      };

      this.despachar(this.espaciosService.crear(dto), {
        accion: 'crear',
        nombre,
        alAceptar: () => {
          this.guardando.set(false);
          this.cerrarModalForm();
        },
        alRechazar: (mensaje) => {
          this.guardando.set(false);
          this.errorModal.set(mensaje ?? 'Error al registrar el nuevo espacio común. Revisa la conexión.');
        },
      });
    }
  }

  protected abrirModalEliminar(espacio: Espacio): void {
    this.espacioAEliminar.set(espacio);
    this.errorModalEliminar.set(null);
    this.modalEliminarVisible.set(true);
  }

  protected cerrarModalEliminar(): void {
    this.modalEliminarVisible.set(false);
    this.espacioAEliminar.set(null);
    this.errorModalEliminar.set(null);
  }

  protected confirmarEliminar(): void {
    const espacio = this.espacioAEliminar();
    if (!espacio) return;

    this.errorModalEliminar.set(null);
    this.eliminando.set(true);

    this.despachar(this.espaciosService.eliminar(espacio.id, this.condominioId), {
      accion: 'eliminar',
      nombre: espacio.nombre,
      alAceptar: () => {
        this.eliminando.set(false);
        this.cerrarModalEliminar();
      },
      alRechazar: (mensaje) => {
        this.eliminando.set(false);
        this.errorModalEliminar.set(mensaje ?? 'No se pudo eliminar el espacio.');
      },
    });
  }

  /**
   * El bff acepta crear/editar/eliminar con 202 y un ticket: el cambio aún no
   * ocurrió. Se espera el resultado del job y recién entonces se informa y se
   * recarga la lista real (sin fabricar tarjetas a partir del 202).
   * `alRechazar` recibe el mensaje solo si el bff no pudo encolar (503); con
   * otro error recibe undefined y cada acción usa su mensaje propio.
   */
  private despachar(
    solicitud: Observable<Respuesta202>,
    opciones: {
      accion: AccionEspacio;
      nombre: string;
      alAceptar: () => void;
      alRechazar: (mensaje?: string) => void;
    },
  ): void {
    const { accion, nombre, alAceptar, alRechazar } = opciones;

    solicitud
      .pipe(
        switchMap((aceptada) => {
          alAceptar();
          this.solicitudesEnCurso.update((n) => n + 1);
          return this.espaciosService.esperarJob(aceptada.ticket_id).pipe(
            catchError((err) => {
              console.error('No se pudo confirmar el resultado de la solicitud:', err);
              return of(null);
            }),
            finalize(() => this.solicitudesEnCurso.update((n) => n - 1)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (job) => this.informarResultado(job, accion, nombre),
        error: (err) => {
          console.error(`Error al enviar la solicitud para ${accion} el espacio:`, err);
          const ocupado = err instanceof HttpErrorResponse && err.status === 503;
          alRechazar(ocupado ? MENSAJE_SERVICIO_OCUPADO : undefined);
        },
      });
  }

  private informarResultado(job: JobEspacio | null, accion: AccionEspacio, nombre: string): void {
    if (!job) {
      this.mostrarFeedback('error', MENSAJE_SIN_CONFIRMAR);
      this.cargarEspacios();
      return;
    }
    if (job.estado === 'FALLIDO') {
      const motivo = job.error?.mensaje;
      this.mostrarFeedback(
        'error',
        motivo ? `No se pudo ${accion} el espacio: ${motivo}` : `No se pudo ${accion} el espacio.`,
      );
      return;
    }

    const nombreResultado =
      typeof job.resultado?.['nombre'] === 'string' ? job.resultado['nombre'] : nombre;
    const mensajes: Record<AccionEspacio, string> = {
      crear: `Espacio "${nombreResultado}" creado correctamente.`,
      editar: `Espacio "${nombreResultado}" actualizado correctamente.`,
      eliminar:
        job.resultado?.['resultado'] === 'inactivado'
          ? `Espacio "${nombre}" quedó inactivo porque tiene reservas registradas.`
          : `Espacio "${nombre}" eliminado.`,
    };
    this.mostrarFeedback('exito', mensajes[accion]);
    this.cargarEspacios();
  }

  protected cerrarFeedback(): void {
    this.feedback.set(null);
  }

  protected mostrarFeedback(tipo: 'exito' | 'error', mensaje: string): void {
    this.feedback.set({ tipo, mensaje });
    setTimeout(() => {
      this.feedback.set(null);
    }, 5000);
  }
}
