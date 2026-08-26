# Convivo Admin — Design System

Sistema de diseño del panel de administración de Convivo (gestión de condominios). Mismo sistema de diseño que `Frontend-CloudNative` (portal de residentes) — tokens de color y tipografía idénticos, ajustado a los componentes y módulos reales de este panel. Referencia de tipografía, color, spacing, iconografía, componentes y accesibilidad para diseño e implementación frontend.

---

## 1. Tipografía

| Rol | Fuente | Estilo | Uso |
| --- | --- | --- | --- |
| Headline | **Gloock** | Serif, alto impacto | Logo, `<h1>`/`<h2>` de pantallas (login, títulos de sección) |
| Body | **Inter** | Sans-serif, legible | Texto de cuerpo, formularios, tablas, botones, labels |

Clases Tailwind: `font-serif` (Gloock, con fallback `Georgia, 'Times New Roman', serif`) y el `font-sans` por defecto (Inter). Tokens definidos en `src/styles.css` vía `@theme`.

**Gap conocido:** `src/styles.css` declara `--font-serif: 'Gloock', ...` pero no importa la fuente Gloock desde Google Fonts (solo Inter se referencia sin `@import`, así que ambas caen al fallback del sistema). `font-serif` renderiza hoy como `Georgia`. Ver AGENTS.md §9 (gotchas) — no se corrige en esta pasada de documentación, se deja registrado como deuda.

### Escala sugerida

| Elemento | Fuente | Tamaño | Line-height | Peso |
| --- | --- | --- | --- | --- |
| H1 (login) | Gloock | 32px / 2rem | tight | Regular |
| H2 | Gloock | 24px / 1.5rem | 1.25 | Regular |
| H3 | Inter | 18px / 1.125rem | 1.3 | Semibold |
| Body | Inter | 16px / 1rem | 1.5 | Regular |
| Small / caption | Inter | 13px / 0.8125rem | 1.4 | Regular |

---

## 2. Color

Modelo de 3 capas — evita hardcodear hex sueltos en templates nuevos, usar clases Tailwind o los tokens ya usados en el proyecto:

1. **Global**: valor crudo (`#0D9488`).
2. **Alias/semántico**: nombre por significado (`Primary`, no `teal-600`).
3. **Componente**: uso actual en `shared/` (`status-badge.ts`, `role-badge.ts`, `toggle.ts`, `field-input.ts`).

### 2.1 Tokens base

| Token | Hex | RGB | Uso | Equivalente Tailwind más cercano |
| --- | --- | --- | --- | --- |
| Background | `#FFFFFF` | 255, 255, 255 | Fondo general de la aplicación | `white` |
| Text | `#00201B` | 0, 32, 27 | Texto principal, panel de marca del login | *(sin equivalente exacto — usar `text-[#00201B]`)* |
| Primary | `#0D9488` | 13, 148, 136 | Acciones principales, botones, enlaces activos, foco | `teal-600` (coincide exacto) |
| Accent | `#005047` | 0, 80, 71 | Hover/pressed sobre Primary | *(sin equivalente exacto — usar `hover:bg-[#005047]`)* |
| Surface | `#FFFFFF` | 255, 255, 255 | Tarjetas, paneles, modales, tabla | `white` |
| Border | `#E2E8F0` | 226, 232, 240 | Bordes, separadores | `slate-200` (coincide exacto) |

**Estado real en código:** el proyecto ya usa estos valores, mezclando hex arbitrario (`text-[#00201B]`, `border-[#E2E8F0]`, `bg-[#0D9488]`, en `login.html`, `field-input.ts`, `toggle.ts`) con clases Tailwind estándar (`teal-*`, `gray-*`, `red-*`, `yellow-*`, `violet-*`, `blue-*`, `orange-*` en `status-badge.ts`/`role-badge.ts`). No hay tokens `@theme` de color declarados en `styles.css` — solo tipografía. Mantener este patrón mixto al tocar componentes existentes; no migrar a tokens CSS nuevos salvo pedido explícito (ver AGENTS.md §6, Ponytail).

### 2.2 Colores de estado (semánticos)

Usados en `status-badge.ts` (siempre con fondo claro `-50`/`-100` + texto `-600`/`-700`, nunca fondo sólido):

| Token | Hex de referencia | Clase real en `status-badge.ts` | Uso |
| --- | --- | --- | --- |
| Alerta | `#E11D48` | `bg-red-50 text-red-700 border-red-100` | `moroso` |
| Advertencia | `#EAB308` | `bg-yellow-50 text-yellow-700 border-yellow-200` | `pendiente`, `en mantención` |
| Éxito / activo | `#16A34A` (aplicado como `teal-*` en este panel) | `bg-teal-50 text-teal-700 border-teal-100` | `activo`, `confirmada`, `habilitado` |
| Neutro | — | `bg-gray-100 text-gray-500 border-gray-200` | `inactivo`, `cancelada`, `vacío` |

Roles (`role-badge.ts`), mismo patrón de badge suave:

| Rol | Clase |
| --- | --- |
| Administrador | `bg-violet-50 text-violet-700 border-violet-100` |
| Comité | `bg-blue-50 text-blue-700 border-blue-100` |
| Conserje | `bg-orange-50 text-orange-700 border-orange-100` |
| Propietario | `bg-teal-50 text-teal-700 border-teal-100` |
| Residente | `bg-gray-100 text-gray-600 border-gray-200` (fallback por defecto) |

### 2.3 Contraste (WCAG 2.1)

Ratios sobre las combinaciones reales de uso más frecuente en este panel:

| Combinación | Ratio | Texto normal | Texto grande / negrita | AAA |
| --- | --- | --- | --- | --- |
| Text (`#00201B`) sobre Background | 17.18:1 | ✅ AA | ✅ | ✅ AAA |
| Blanco sobre Primary (`#0D9488`) | 3.74:1 | ❌ | ✅ AA (≥18pt regular o ≥14pt bold) | — |
| Text sobre Primary | 4.59:1 | ✅ AA | ✅ | — |
| Blanco sobre Accent (`#005047`) | 9.38:1 | ✅ AA | ✅ | ✅ AAA |
| Blanco sobre Advertencia (`#EAB308`) | 1.92:1 | ❌ | ❌ | — |

**Reglas derivadas:**

- Botones sólidos con fondo **Primary** (login, acciones principales): el proyecto ya usa texto blanco en botones de tamaño normal-negrita (`Iniciar sesión`) — cumple el umbral de 14pt bold. No usar Primary sólido con texto blanco en elementos más pequeños (badges, chips) sin negrita.
- Badges de **Advertencia** (`pendiente`, `en mantención`): correcto en el código actual — usan `text-yellow-700` sobre `bg-yellow-50` (fondo claro, no el amarillo sólido `#EAB308`), evitando la falla de contraste del amarillo puro. Si se agrega un badge/botón con `#EAB308` sólido, el texto debe ser oscuro (`text-[#00201B]`), nunca blanco.

---

## 3. Spacing y tamaños

Sin escala de tokens de spacing declarada — el proyecto usa la escala default de Tailwind directamente en clases (`p-2.5`, `gap-4`, `px-3.5`, `py-2.5`, etc.). No introducir tokens `space-*` custom salvo que se repita un valor fuera de la escala Tailwind 3+ veces.

## 4. Radius y transición

| Patrón real en código | Uso |
| --- | --- |
| `rounded-lg` | Inputs, botones, cards |
| `rounded-full` | Badges, avatares, toggle |
| `rounded-md` | Ícono de marca (logo cuadrado) |
| `transition-colors duration-200` | Hover, focus, toggle |

Sin librería de animación. Sin manejo explícito de `prefers-reduced-motion` todavía (las únicas transiciones son `transition-colors`, de bajo impacto — no se considera deuda bloqueante, pero cualquier animación no trivial que se agregue debe respetarlo).

## 5. Breakpoints

Solo Tailwind default (`sm`/`md`/`lg`). Único uso real: `lg:` en `login.html` para mostrar/ocultar el panel de marca (`hidden lg:flex` / `lg:hidden`). El resto del panel (tablas, dashboard) no tiene tratamiento responsive explícito documentado — no asumir mobile-first hasta verificar cada pantalla.

---

## 6. Iconografía

**lucide-angular** (`^1.0.0`), estilo outline consistente con el portal de residentes.

- Color por defecto: heredado del texto (`text-[#00201B]` o `text-gray-*` según contexto).
- Estado activo/seleccionado en nav: **Primary** (`#0D9488`).
- No mezclar con otro set de íconos ni con estilo filled.

### 6.1 Mapeo icono → funcionalidad (íconos ya importados en el proyecto)

| Icono (`lucide-angular`) | Funcionalidad |
| --- | --- |
| `Home` | Dashboard / inicio |
| `Users` | Gestión de usuarios y roles |
| `Building2` | Condominios y unidades / logo de marca |
| `Search` | Búsqueda (espacios comunes, filtro de usuarios) |
| `Calendar` | Reservas |
| `Settings` | Configuración de cuenta |
| `DollarSign` | Gastos comunes *(nav "próximamente")* |
| `MessageSquare` | Tablón de avisos *(nav "próximamente")* |
| `Camera` | Registro fotográfico *(nav "próximamente")* |
| `Target` | Incidentes *(nav "próximamente")* |
| `Bell` | Notificaciones *(nav "próximamente")* |
| `Lock` | Módulo bloqueado / pendiente |
| `LogOut` | Cerrar sesión |
| `Shield` | Login SSO corporativo |
| `Eye` / `EyeOff` | Mostrar/ocultar contraseña |
| `MoreHorizontal` | Acciones adicionales por fila (tabla de usuarios) |
| `X` | Cerrar modal/panel de detalle |
| `Edit2` | Editar registro |
| `Plus` | Crear nuevo registro |

---

## 7. Componentes

Componentes compartidos reales en `src/app/shared/`:

### StatusBadge (`status-badge.ts`)

- **Anatomía**: `<span>` con padding `px-2.5 py-0.5`, `rounded-full`, `text-xs font-medium`, borde 1px.
- **Uso**: `<app-status-badge [status]="entry.status" />`. Estados soportados: `activo`, `inactivo`, `confirmada`, `pendiente`, `cancelada`, `moroso`, `habilitado`, `en mantención`, `vacío`. Fallback = estilo `inactivo` si el string no matchea.
- **Accesibilidad**: es texto plano dentro de un badge visual — el estado también debe ser legible en la columna/label adyacente, no depender solo del color.

### RoleBadge (`role-badge.ts`)

- Mismo patrón que StatusBadge. Estados: `Administrador`, `Comité`, `Conserje`, `Propietario`, `Residente` (fallback).

### Toggle (`toggle.ts`)

- **Anatomía**: botón `role="switch"` de 40×24px con knob circular de 20px, `aria-checked` reactivo.
- **Estados**: on = `bg-[#0D9488]` + knob desplazado; off = `bg-gray-200`. Focus visible con `focus:ring-2 focus:ring-[#0D9488]`.
- **Accesibilidad**: ya implementa `role="switch"` + `aria-checked` — mantener este patrón en toggles nuevos, no usar `<input type="checkbox">` oculto.

### FieldInput (`field-input.ts`)

- **Anatomía**: label (`text-sm font-medium`) + input con `rounded-lg border`, focus con `ring-2 ring-teal-100 border-[#0D9488]`.
- **Estados**: default, disabled (`bg-gray-50 text-gray-400 cursor-not-allowed`).
- **Gap**: no expone `id`/`for` entre label e input — el label no está asociado programáticamente al campo. Ver accesibilidad, sección 8.

### Botón (sin componente propio — patrón inline repetido en `login.html`)

- Primario: `bg-[#0D9488] hover:bg-[#005047] text-white py-3 px-4 rounded-lg text-sm font-medium`.
- Secundario: `border border-[#E2E8F0] text-[#00201B] hover:bg-gray-50`.
- No hay componente `Button` reutilizable todavía — cada pantalla repite las clases. No extraer un componente por adelantado (Ponytail): esperar a que un tercer botón lo necesite antes de abstraer.

---

## 8. Accesibilidad

No se limita a contraste de color (sección 2.3) — cubrir también:

- **Teclado**: `Toggle` y los botones nativos son alcanzables por `Tab`/`Enter`/`Space` por defecto. Verificar que las filas de tabla con acciones (`MoreHorizontal`) también lo sean al agregar interactividad.
- **Foco visible**: `Toggle` y los inputs (`field-input.ts`, `login.html`) ya usan `focus:ring-2` — mantener este patrón, nunca `outline: none` sin reemplazo.
- **Lectores de pantalla**: `FieldInput` tiene gap de asociación label/input (sección 7) — corregir con `id`/`for` la próxima vez que se toque ese componente, no de forma retroactiva sin pedido.
- **Touch target**: verificar 44×44px mínimo en botones de ícono solo (`icMore`, `icX`, `icEdit`) antes de dar por cerrada una pantalla táctil — no medido todavía.
- **Movimiento**: sin animaciones más allá de `transition-colors`; si se agrega algo más elaborado, respetar `prefers-reduced-motion` (no implementado hoy, ver sección 4).

Nivel objetivo: WCAG 2.1 AA (mismo criterio que `Frontend-CloudNative`).

---

## 9. Aplicación por módulo (rutas reales del panel)

| Ruta | Pantalla | Color dominante | Ícono principal |
| --- | --- | --- | --- |
| `/login` | Login | Text (`#00201B`) sobre panel oscuro + Primary en CTA | `Building2`, `Shield` |
| `/dashboard` | Inicio | Primary | `Home` |
| `/users` | Usuarios y roles | Primary + colores por rol (§2.2) | `Users` |
| `/condominios` | Condominios y unidades | Primary | `Building2` |
| `/espacios` | Espacios comunes | Primary | `Search` |
| `/reservas` | Reservas | Primary → Éxito al confirmar | `Calendar` |
| `/config` | Configuración de cuenta | Text (neutral) | `Settings` |

Módulos en nav como "próximamente" (sin ruta, ver `shell.ts` `SOON_ITEMS`): Gastos comunes, Tablón de avisos, Registro fotográfico, Incidentes, Notificaciones — mismo mapeo de color/ícono que en `Frontend-CloudNative` DESIGN.md §4 cuando se implementen acá.

---

## 10. Gobierno y mantenimiento

- **Fuente de verdad**: código (`src/app/shared/*`, `src/styles.css`, clases inline en templates) — no hay Figma/tokens sincronizados vía pipeline. Este documento describe el estado real, no un ideal a implementar.
- **Consistencia con `Frontend-CloudNative`**: los tokens de color y tipografía de la sección 1-2 son intencionalmente idénticos al portal de residentes (mismo proyecto Convivo, dos frontends). Si la paleta cambia en uno, replicar en el otro.
- **Cómo proponer un cambio**: PR a este archivo + verificación de que el cambio ya existe en código (o se implementa en el mismo PR) — no documentar aspiracional.
- Tratar como código: agregar sección cuando un patrón se repite 3+ veces (ej. un componente `Button` real), eliminar cuando ya no se usa.

---

## 11. Referencias

- Mismo sistema de diseño que `../Frontend-CloudNative/DESIGN.md` (portal de residentes Convivo).
- Paleta de estado y roles: heredada del ERS de Convivo (ver `Frontend-CloudNative/AGENTS.md` §6 para el modelo de roles del portal — este panel usa un enum de roles más amplio: `Propietario`, `Residente`, `Comité`, `Conserje`, `Administrador`).
- Librería de íconos: [lucide-angular](https://lucide.dev/guide/packages/lucide-angular).
