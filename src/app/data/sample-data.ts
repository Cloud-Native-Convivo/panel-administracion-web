// Datos de ejemplo del prototipo (sin backend).

export interface UserEntry {
  id: number;
  name: string;
  role: string;
  unit: string;
  status: string;
  email: string;
  phone: string;
}

export type ReservationStatus = 'confirmada' | 'pendiente' | 'cancelada';

export interface ReservationEntry {
  id: number;
  space: string;
  user: string;
  unit: string;
  date: string;
  time: string;
  status: ReservationStatus;
}

export interface EspacioEntry {
  id: number;
  name: string;
  capacity: string;
  hours: string;
  status: string;
  img: string;
  desc: string;
}

export interface UnitEntry {
  id: string;
  num: string;
  owner: string;
  residents: string[];
  status: string;
  moroso: boolean;
}

export interface TorreEntry {
  id: string;
  name: string;
  units: UnitEntry[];
}

export const USERS: UserEntry[] = [
  { id: 1, name: "Carlos Muñoz Pérez",    role: "Propietario",   unit: "Torre A · Depto 302",   status: "activo",   email: "carlos.munoz@gmail.com", phone: "+56 9 8765 4321" },
  { id: 2, name: "María González Vidal",  role: "Residente",     unit: "Torre A · Depto 302",   status: "activo",   email: "m.gonzalez@gmail.com",   phone: "+56 9 7654 3210" },
  { id: 3, name: "Roberto Silva Torres",  role: "Propietario",   unit: "Torre B · Depto 104",   status: "activo",   email: "r.silva@empresa.cl",     phone: "+56 9 6543 2109" },
  { id: 4, name: "Ana Ramírez Fuentes",   role: "Propietario",   unit: "Torre B · Depto 201",   status: "inactivo", email: "a.ramirez@hotmail.com",  phone: "+56 9 5432 1098" },
  { id: 5, name: "Pedro Contreras López", role: "Comité",        unit: "Torre A · Depto 502",   status: "activo",   email: "p.contreras@gmail.com",  phone: "+56 9 4321 0987" },
  { id: 6, name: "Lucía Herrera Soto",    role: "Conserje",      unit: "Conserjería Principal", status: "activo",   email: "l.herrera@convivo.cl",   phone: "+56 9 3210 9876" },
  { id: 7, name: "Jorge Morales Díaz",    role: "Administrador", unit: "Oficina Administración",status: "activo",   email: "j.morales@convivo.cl",   phone: "+56 2 2345 6789" },
  { id: 8, name: "Valentina Castro Ríos", role: "Residente",     unit: "Torre C · Depto 301",   status: "activo",   email: "v.castro@gmail.com",     phone: "+56 9 2109 8765" },
  { id: 9, name: "Martín Fuentes Araya",  role: "Propietario",   unit: "Torre B · Depto 305",   status: "activo",   email: "m.fuentes@gmail.com",    phone: "+56 9 1098 7654" },
  { id: 10, name: "Isabel Vargas Molina", role: "Propietario",   unit: "Torre A · Depto 101",   status: "activo",   email: "i.vargas@gmail.com",     phone: "+56 9 0987 6543" },
];

export const INIT_RESERVATIONS: ReservationEntry[] = [
  { id: 1, space: "Piscina",          user: "Carlos Muñoz",     unit: "Torre A · 302", date: "Hoy, 23 ago",    time: "10:00–12:00", status: "confirmada" },
  { id: 2, space: "Quincho A",        user: "Roberto Silva",    unit: "Torre B · 104", date: "Hoy, 23 ago",    time: "13:00–18:00", status: "pendiente"  },
  { id: 3, space: "Gimnasio",         user: "Valentina Castro", unit: "Torre C · 301", date: "Mañana, 24 ago", time: "07:00–08:00", status: "confirmada" },
  { id: 4, space: "Salón de Eventos", user: "Pedro Contreras",  unit: "Torre A · 502", date: "Lun, 25 ago",    time: "18:00–23:00", status: "pendiente"  },
  { id: 5, space: "Cancha de Pádel",  user: "Martín Fuentes",   unit: "Torre B · 305", date: "Lun, 25 ago",    time: "08:00–09:30", status: "confirmada" },
  { id: 6, space: "Quincho B",        user: "Ana Ramírez",      unit: "Torre B · 201", date: "Mar, 26 ago",    time: "12:00–17:00", status: "cancelada"  },
  { id: 7, space: "Piscina",          user: "Isabel Vargas",    unit: "Torre A · 101", date: "Mié, 27 ago",    time: "15:00–17:00", status: "pendiente"  },
];

export const ESPACIOS: EspacioEntry[] = [
  { id: 1, name: "Piscina",          capacity: "40 personas", hours: "Lun–Dom  8:00–20:00",               status: "habilitado",    img: "https://images.unsplash.com/photo-1613152184920-bc1c4ab7fd1d?w=600&h=380&fit=crop&auto=format", desc: "Piscina temperada con zona de descanso y sombrillas." },
  { id: 2, name: "Quincho A",        capacity: "30 personas", hours: "Lun–Dom  10:00–22:00",              status: "habilitado",    img: "https://images.unsplash.com/photo-1560448204-444f743ef6e7?w=600&h=380&fit=crop&auto=format", desc: "Quincho con parrilla, mesón y terraza techada."       },
  { id: 3, name: "Gimnasio",         capacity: "15 personas", hours: "L–V  6:00–22:00 · S–D  8:00–20:00", status: "habilitado",    img: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=380&fit=crop&auto=format", desc: "Equipamiento cardio y musculación completo."          },
  { id: 4, name: "Salón de Eventos", capacity: "80 personas", hours: "Lun–Dom  10:00–00:00",              status: "en mantención", img: "https://images.unsplash.com/photo-1529290130-4ca3753253ae?w=600&h=380&fit=crop&auto=format", desc: "Salón multiuso con cocina equipada y audio."          },
  { id: 5, name: "Cancha de Pádel",  capacity: "4 personas",  hours: "Lun–Dom  7:00–21:00",               status: "habilitado",    img: "https://images.unsplash.com/photo-1764254811090-af4a43594a03?w=600&h=380&fit=crop&auto=format", desc: "Cancha techada con iluminación nocturna."             },
  { id: 6, name: "Quincho B",        capacity: "25 personas", hours: "Lun–Dom  10:00–22:00",              status: "habilitado",    img: "https://images.unsplash.com/photo-1680609989998-6183fcea718b?w=600&h=380&fit=crop&auto=format", desc: "Quincho con vista al jardín y horno de barro."        },
];

export const TORRES: TorreEntry[] = [
  { id: "A", name: "Torre A", units: [
    { id: "A-101", num: "101", owner: "Isabel Vargas Molina",  residents: ["Isabel Vargas Molina"],                       status: "activo",   moroso: false },
    { id: "A-202", num: "202", owner: "Diego Álvarez Ruiz",    residents: ["Diego Álvarez Ruiz", "Paula Álvarez"],        status: "activo",   moroso: true  },
    { id: "A-302", num: "302", owner: "Carlos Muñoz Pérez",    residents: ["Carlos Muñoz Pérez", "María González Vidal"], status: "activo",   moroso: false },
    { id: "A-401", num: "401", owner: "Sofía Reyes Ortega",    residents: [],                                             status: "vacío",    moroso: false },
    { id: "A-502", num: "502", owner: "Pedro Contreras López", residents: ["Pedro Contreras López"],                      status: "activo",   moroso: false },
  ]},
  { id: "B", name: "Torre B", units: [
    { id: "B-104", num: "104", owner: "Roberto Silva Torres",  residents: ["Roberto Silva Torres"],                       status: "activo",   moroso: false },
    { id: "B-201", num: "201", owner: "Ana Ramírez Fuentes",   residents: [],                                             status: "inactivo", moroso: true  },
    { id: "B-305", num: "305", owner: "Martín Fuentes Araya",  residents: ["Martín Fuentes Araya", "Carolina Fuentes"],   status: "activo",   moroso: false },
  ]},
  { id: "C", name: "Torre C", units: [
    { id: "C-101", num: "101", owner: "Laura Soto Pizarro",    residents: ["Laura Soto Pizarro"],                         status: "activo",   moroso: false },
    { id: "C-301", num: "301", owner: "Valentina Castro Ríos", residents: ["Valentina Castro Ríos"],                      status: "activo",   moroso: false },
    { id: "C-402", num: "402", owner: "—",                     residents: [],                                             status: "vacío",    moroso: false },
  ]},
];

// Iniciales de un nombre (máx. 2 palabras)
export function ini(name: string): string {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}
