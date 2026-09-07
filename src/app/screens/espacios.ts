import { Component, OnInit, inject, signal } from '@angular/core';
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
import { EspaciosService } from '../services/espacios.service';
import { Espacio, CrearEspacioDto, ActualizarEspacioDto } from '../models/espacio.model';

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
  imports: [LucideAngularModule, StatusBadge, FormsModule],
  templateUrl: './espacios.html',
})
export class Espacios implements OnInit {
  private readonly espaciosService = inject(EspaciosService);

  // Estado reactivo principal
  protected readonly espacios = signal<Espacio[]>([]);
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly guardando = signal<boolean>(false);
  protected readonly eliminando = signal<boolean>(false);

  // Modales
  protected readonly modalFormVisible = signal<boolean>(false);
  protected readonly modoEdicion = signal<boolean>(false);
  protected readonly espacioEnEdicion = signal<Espacio | null>(null);

  protected readonly modalEliminarVisible = signal<boolean>(false);
  protected readonly espacioAEliminar = signal<Espacio | null>(null);

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

    this.espaciosService.listar().subscribe({
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

      this.espaciosService.actualizar(actual.id, dto).subscribe({
        next: (actualizado) => {
          this.espacios.update((lista) =>
            lista.map((e) => (e.id === actualizado.id ? actualizado : e)),
          );
          this.guardando.set(false);
          this.cerrarModalForm();
          this.mostrarFeedback('exito', `Espacio "${actualizado.nombre}" actualizado con éxito.`);
        },
        error: (err) => {
          console.error('Error al actualizar espacio:', err);
          this.guardando.set(false);
          this.errorModal.set('Error al actualizar el espacio común. Revisa la conexión.');
        },
      });
    } else {
      const dto: CrearEspacioDto = {
        nombre,
        capacidad: Math.floor(capacidad),
        tarifa_hora,
        ubicacion: f.ubicacion.trim() || null,
        descripcion: f.descripcion.trim() || null,
      };

      this.espaciosService.crear(dto).subscribe({
        next: (nuevo) => {
          this.espacios.update((lista) => [...lista, nuevo]);
          this.guardando.set(false);
          this.cerrarModalForm();
          this.mostrarFeedback('exito', `Espacio "${nuevo.nombre}" creado exitosamente.`);
        },
        error: (err) => {
          console.error('Error al crear espacio:', err);
          this.guardando.set(false);
          this.errorModal.set('Error al registrar el nuevo espacio común. Revisa la conexión.');
        },
      });
    }
  }

  protected abrirModalEliminar(espacio: Espacio): void {
    this.espacioAEliminar.set(espacio);
    this.modalEliminarVisible.set(true);
  }

  protected cerrarModalEliminar(): void {
    this.modalEliminarVisible.set(false);
    this.espacioAEliminar.set(null);
  }

  protected confirmarEliminar(): void {
    const espacio = this.espacioAEliminar();
    if (!espacio) return;

    this.eliminando.set(true);

    this.espaciosService.eliminar(espacio.id).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.cerrarModalEliminar();
        this.mostrarFeedback(
          'exito',
          `Operación completada sobre "${espacio.nombre}" (eliminado o marcado como inactivo).`,
        );
        // Recargar lista para reflejar estado real (físicamente eliminado o inactivado con reservas)
        this.cargarEspacios();
      },
      error: (err) => {
        console.error('Error al eliminar espacio:', err);
        this.eliminando.set(false);
        this.mostrarFeedback('error', 'No se pudo eliminar el espacio.');
      },
    });
  }

  protected imagenPrevia(): string {
    const nombre = this.formulario().nombre;
    return this.espaciosService.obtenerImagenTematica(nombre);
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
