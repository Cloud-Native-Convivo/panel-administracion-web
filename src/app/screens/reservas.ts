import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import {
  Plus,
  Check,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Calendar as CalendarIcon,
} from 'lucide-angular';
import type { ReservationStatus } from '../data/sample-data';
import { StatusBadge } from '../shared/status-badge';
import { ReservasService } from '../services/reservas.service';
import { EspaciosService } from '../services/espacios.service';
import { Espacio } from '../models/espacio.model';
import { mapearReservaUi, type UiReservationEntry } from '../shared/reserva-mapper';

@Component({
  selector: 'app-reservas',
  imports: [LucideAngularModule, StatusBadge],
  templateUrl: './reservas.html',
})
export class Reservas implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly espaciosService = inject(EspaciosService);

  // Estados de vista y filtros
  protected readonly view = signal<'lista' | 'calendario'>('lista');
  protected readonly spaceFilter = signal('Todos');
  protected readonly statFilter = signal('Todos');
  protected readonly views: ('lista' | 'calendario')[] = ['lista', 'calendario'];
  protected readonly statusOptions: ('Todos' | ReservationStatus)[] = [
    'Todos',
    'confirmada',
    'pendiente',
    'cancelada',
  ];

  // Datos reactivos
  protected readonly rsvs = signal<UiReservationEntry[]>([]);
  protected readonly espaciosMap = signal<Map<number, string>>(new Map());
  protected readonly cargando = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmandoId = signal<number | null>(null);
  protected readonly feedback = signal<{
    tipo: 'exito' | 'error';
    mensaje: string;
  } | null>(null);

  // Iconos del template
  protected readonly icPlus = Plus;
  protected readonly icCheck = Check;
  protected readonly icTrash = Trash2;
  protected readonly icRefresh = RefreshCw;
  protected readonly icAlert = AlertCircle;
  protected readonly icCheckCircle = CheckCircle2;
  protected readonly icX = X;
  protected readonly icCalendar = CalendarIcon;

  // Espacios únicos para el selector de filtros
  protected readonly spaceOptions = computed(() => {
    const espaciosEnReservas = this.rsvs().map((r) => r.space);
    const nombresEspacios = Array.from(this.espaciosMap().values());
    const combinados = Array.from(new Set([...espaciosEnReservas, ...nombresEspacios])).filter(Boolean);
    return ['Todos', ...combinados];
  });

  // Lista filtrada
  protected readonly filtered = computed(() =>
    this.rsvs().filter((r) => {
      const ms = this.spaceFilter() === 'Todos' || r.space === this.spaceFilter();
      const mt = this.statFilter() === 'Todos' || r.status === this.statFilter();
      return ms && mt;
    }),
  );

  // Días de la semana actual (Lunes a Domingo)
  protected readonly weekDays = computed<string[]>(() => {
    const lunes = this.obtenerLunesActual();
    const diasNombres = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      return `${diasNombres[i]} ${dia.getDate()}`;
    });
  });

  // Título dinámico para la semana del calendario
  protected readonly weekTitle = computed(() => {
    const lunes = this.obtenerLunesActual();
    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const meses = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    if (lunes.getMonth() === domingo.getMonth()) {
      return `Semana del ${lunes.getDate()} al ${domingo.getDate()} de ${meses[lunes.getMonth()]} ${domingo.getFullYear()}`;
    }
    return `Semana del ${lunes.getDate()} de ${meses[lunes.getMonth()]} al ${domingo.getDate()} de ${meses[domingo.getMonth()]} ${domingo.getFullYear()}`;
  });

  // Reservas por cada día de la semana actual (índice 0 = Lunes, ..., 6 = Domingo)
  protected readonly cal = computed<UiReservationEntry[][]>(() => {
    const lunes = this.obtenerLunesActual();
    const items = this.filtered();

    return Array.from({ length: 7 }, (_, i) => {
      const targetDate = new Date(lunes);
      targetDate.setDate(lunes.getDate() + i);

      return items.filter((r) => {
        const d = new Date(r.fechaInicioIso);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === targetDate.getFullYear() &&
          d.getMonth() === targetDate.getMonth() &&
          d.getDate() === targetDate.getDate()
        );
      });
    });
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  protected cargarDatos(): void {
    this.cargando.set(true);
    this.error.set(null);

    forkJoin({
      espacios: this.espaciosService.listar().pipe(
        catchError((err) => {
          console.warn('No se pudieron obtener espacios comunes:', err);
          return of([] as Espacio[]);
        }),
      ),
      reservas: this.reservasService.listar(),
    }).subscribe({
      next: ({ espacios, reservas }) => {
        const mapaEspacios = new Map<number, string>();
        for (const e of espacios) {
          mapaEspacios.set(e.id, e.nombre);
        }
        this.espaciosMap.set(mapaEspacios);

        const mapeadas = reservas.map((r) => mapearReservaUi(r, mapaEspacios));
        this.rsvs.set(mapeadas);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al conectar con backend de reservas:', err);
        this.error.set(
          'No se pudo conectar con el microservicio de espacios comunes. Verifica que esté en ejecución en el puerto 8082.',
        );
        this.cargando.set(false);
      },
    });
  }

  protected confirm(id: number): void {
    this.confirmandoId.set(id);
    this.reservasService.confirmarPago(id).subscribe({
      next: () => {
        this.confirmandoId.set(null);
        this.rsvs.update((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'confirmada' } : r)),
        );
        this.mostrarFeedback('exito', `Reserva #${id} confirmada exitosamente.`);
      },
      error: (err) => {
        this.confirmandoId.set(null);
        console.error('Error al confirmar reserva:', err);
        this.mostrarFeedback('error', `Error al confirmar la reserva #${id}.`);
      },
    });
  }

  protected cancel(id: number): void {
    this.rsvs.update((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'cancelada' } : r)),
    );
    this.mostrarFeedback('exito', `Reserva #${id} cancelada.`);
  }

  protected cerrarFeedback(): void {
    this.feedback.set(null);
  }

  protected capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  private mostrarFeedback(tipo: 'exito' | 'error', mensaje: string): void {
    this.feedback.set({ tipo, mensaje });
    setTimeout(() => {
      this.feedback.set(null);
    }, 5000);
  }

  private obtenerLunesActual(): Date {
    const hoy = new Date();
    const diaSemana = hoy.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const diasDesdeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - diasDesdeLunes);
    lunes.setHours(0, 0, 0, 0);
    return lunes;
  }

}
