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
    this.modoEdicion.set(true);
    this.espacioEnEdicion.set(espacio);
    this.modalFormVisible.set(true);
  }

  protected cerrarModalForm(): void {
    this.modalFormVisible.set(false);
    this.modoEdicion.set(false);
    this.espacioEnEdicion.set(null);
  }

  protected guardarEspacio(): void {
    const f = this.formulario();
    if (!f.nombre.trim()) {
      this.mostrarFeedback('error', 'El nombre del espacio es obligatorio.');
      return;
    }
    if (f.capacidad <= 0) {
      this.mostrarFeedback('error', 'La capacidad debe ser mayor a 0.');
      return;
    }

    this.guardando.set(true);

    if (this.modoEdicion()) {
      const actual = this.espacioEnEdicion();
      if (!actual) return;

      const dto: ActualizarEspacioDto = {
        nombre: f.nombre.trim(),
        capacidad: f.capacidad,
        tarifa_hora: f.tarifa_hora,
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
          this.mostrarFeedback('error', 'Error al actualizar el espacio común.');
        },
      });
    } else {
      const dto: CrearEspacioDto = {
        nombre: f.nombre.trim(),
        capacidad: f.capacidad,
        tarifa_hora: f.tarifa_hora,
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
          this.mostrarFeedback('error', 'Error al registrar el nuevo espacio común.');
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

  protected mostrarFeedback(tipo: 'exito' | 'error', mensaje: string): void {
    this.feedback.set({ tipo, mensaje });
    setTimeout(() => {
      this.feedback.set(null);
    }, 5000);
  }
}
