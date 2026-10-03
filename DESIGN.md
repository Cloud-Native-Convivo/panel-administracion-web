# Convivo — Design System

Sistema de diseño de Convivo — plataforma digital para la gestión de condominios residenciales en Chile. Referencia de tipografía, color, spacing, iconografía, componentes y accesibilidad para diseño e implementación frontend.

**Para el agente que diseñe con esta plantilla:**

- Sin emojis en UI, iconografía ni copy — usar solo como último recurso si no existe alternativa real (ícono, ilustración, texto), nunca como decoración por defecto.
- Nada de diseño genérico de plantilla. Cada decisión (color, tipografía, componente, layout) responde al proyecto real y a lo que pidió el usuario — no copiar el default de un framework ni reciclar un patrón sin pensar el caso de uso concreto.

---

## 1. Tipografía

| Rol | Fuente | Estilo | Uso |
| --- | --- | --- | --- |
| Headline | **Gloock** | Serif, alto impacto | Títulos de página, encabezados de sección |
| Body | **Inter** | Sans-serif, legible | Texto de cuerpo, formularios, componentes UI, labels |

### Escala sugerida

| Elemento | Fuente | Tamaño | Line-height | Peso |
| --- | --- | --- | --- | --- |
| H1 | Gloock | 32px / 2rem | 1.2 | Regular |
| H2 | Gloock | 24px / 1.5rem | 1.25 | Regular |
| H3 | Inter | 18px / 1.125rem | 1.3 | Semibold |
| Body | Inter | 16px / 1rem | 1.5 | Regular |
| Small / caption | Inter | 13px / 0.8125rem | 1.4 | Regular |

Line-height más alto en texto de cuerpo (legibilidad en párrafos largos), más bajo en headlines (impacto visual).

**Restricciones de accesibilidad que la escala debe soportar** — no son sugerencias de estilo, son criterios WCAG que fallan si la maqueta es rígida:

| Criterio | Nivel | Qué obliga |
| --- | --- | --- |
| 1.4.4 Redimensionar texto | AA | el texto debe poder ampliarse al **200%** sin pérdida de contenido ni de funcionalidad |
| 1.4.12 Espaciado del texto | AA | si el usuario fuerza line-height **1.5×**, espacio tras párrafo **2×**, letter-spacing **0.12em** y word-spacing **0.16em** del tamaño de fuente, nada se corta, se superpone ni desaparece |

Ojo con 1.4.12: no obliga a **usar** esos valores, obliga a **sobrevivirlos**. Es la razón práctica para definir tamaños en `rem` y alturas en `min-height` en vez de `height` fija: un botón con alto fijo y texto centrado por `line-height` rompe apenas el usuario aplica su propia hoja de estilos.

Probarlo cuesta un minuto: aplicar esos cuatro valores con el bookmarklet de espaciado de texto o desde devtools, y recorrer las pantallas densas (tablas, tarjetas, navegación).

---

## 2. Color

Modelo de 3 capas — evita hardcodear hex en componentes:

1. **Global**: valor crudo (`#0D9488`).
2. **Alias/semántico**: nombre por significado, no apariencia (`Primary`, no `teal-600`) — sección 2.1.
3. **Componente**: token scoped que referencia un alias (`button-bg` → `Primary`) — sección 2.2, opcional, agregar si el equipo ya tiene suficientes componentes para justificarlo.

**Formato de intercambio**: tokens solo en código (`src/index.css` vía Tailwind v4 `@theme inline`). No hay archivo JSON DTCG separado — si se adopta Figma o Tokens Studio en el futuro, exportar desde los tokens CSS.

**Estado actual del código — el modelo de arriba es el objetivo, no lo implementado.** `src/index.css` define tokens de color (`--color-*`) y tipografía (`--font-*`) dentro de `@theme inline`; `src/components/Layout.tsx` aún tiene valores hardcodeados (colores inline, breakpoints en `<style>`) que son deuda técnica conocida. Los colores de §2.1 se usan como clases de Tailwind generadas de los tokens CSS — verificar que no haya hex sueltos fuera de `src/index.css`.

### 2.1 Tokens base (global + alias)

| Token | Hex | RGB | CMYK | Uso |
| --- | --- | --- | --- | --- |
| Background | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | Fondo general de la aplicación |
| Text | `#00201B` | 0, 32, 27 | 100, 0, 16, 87 | Texto principal sobre fondos claros |
| Primary | `#0D9488` | 13, 148, 136 | 91, 0, 8, 42 | Acciones principales, botones, enlaces activos |
| Accent | `#005047` | 0, 80, 71 | 100, 0, 11, 69 | Estados hover/presionado, énfasis secundario |
| Primary on dark | `#5EEAD4` | 94, 234, 212 | 60, 0, 9, 8 | Títulos y acentos sobre fondo Text (footer, hero); clase `text-primary-on-dark` |
| Surface | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | Tarjetas, paneles, modales |
| Border | `#E2E8F0` | 226, 232, 240 | 6, 3, 0, 6 | Bordes, separadores, líneas divisorias |
| Muted | `#64748B` | 100, 116, 139 | 28, 17, 0, 45 | Texto secundario, labels desactivados |

Los tokens se declaran con `@theme inline`: Tailwind los incrusta en cada clase y **no** emite `--color-*` en `:root`. Por eso `style={{ color: "var(--color-primary)" }}` no funciona — un color que depende de estado va como clase completa (`bg-primary`, `text-accent`), no como estilo inline ni hex.

### 2.2 Tokens de componente

| Token | Referencia | Uso |
| --- | --- | --- |
| `button-primary-bg` | Primary | Fondo botón principal |
| `input-border-focus` | Primary | Borde de input en foco |
| `card-surface` | Surface | Fondo de tarjetas |
| `nav-bg` | Surface (97% opacity) | Fondo de la barra de navegación |
| `nav-border` | Border | Borde inferior del nav |
| `ribbon-bg` | Accent | Fondo de la barra de anuncios |
| `sidebar-item-bg` | varies (Primary, Accent, Alerta) | Fondo de botones del sidebar flotante |
| `footer-bg` | Text (`#00201B`) | Fondo del pie de página |

### 2.3 Colores de estado (semánticos)

| Token | Hex | Uso |
| --- | --- | --- |
| Alerta | `#E11D48` | Estados críticos/urgentes, botón de emergencia |
| Advertencia | `#EAB308` | Estados pendientes o parciales |
| Éxito | `#16A34A` | Estados confirmados, "OK" |

### 2.4 Dark mode (opcional)

(no aplica: sin soporte actual — futura implementación)

### 2.5 Contraste (WCAG 2.1)

**Umbrales exactos** — cuál aplica depende del tamaño del texto y de si es texto o no:

| Criterio | Nivel | Umbral |
| --- | --- | --- |
| 1.4.3 Contraste (mínimo) | AA | **4.5:1** texto normal · **3:1** texto grande |
| 1.4.6 Contraste (mejorado) | AAA | **7:1** texto normal · **4.5:1** texto grande |
| 1.4.11 Contraste no textual | AA | **3:1** para componentes de interfaz y objetos gráficos |

"Texto grande" = ≥18pt regular (≈24px) o ≥14pt en negrita (≈18.66px). Por debajo de eso rige 4.5:1, sin importar cuán bien se vea en la pantalla del diseñador.

**1.4.11 es el que más se olvida**: bordes de input, íconos con significado, indicadores de foco, barras de un gráfico y estados de un toggle necesitan 3:1 contra lo que tengan al lado. Un input con borde `#E2E8F0` sobre blanco no llega, y no aparece en ninguna tabla de contraste de texto.

Ratios calculados sobre las combinaciones reales de uso más frecuente:

| Combinación | Ratio | Texto normal | Texto grande / negrita | AAA |
| --- | --- | --- | --- | --- |
| Text sobre Background | 17.18:1 | ✅ AA | ✅ | ✅ AAA |
| Blanco sobre Primary | 3.74:1 | ❌ | ✅ AA (≥18pt regular o ≥14pt bold) | — |
| Text sobre Primary | 4.59:1 | ✅ AA | ✅ | — |
| Blanco sobre Advertencia | 1.92:1 | ❌ | ❌ | — |
| Blanco sobre Éxito | 3.30:1 | ❌ | ✅ AA (grande/negrita) | — |

Probar cada color de §2.1 y §2.3 contra blanco y contra Text, no solo los que "se ven bien" — los dos casos de falla arriba (Advertencia, Éxito) son los que justifican tener esta tabla: sin medirlos, un botón de Advertencia con texto blanco pasa desapercibido en diseño y falla en producción.

**Reglas derivadas**:

- Botones con fondo **Primary**: texto blanco solo en negrita ≥14pt (o regular ≥18pt); en botones pequeños usar **Text** sobre Primary.
- Badges de **Advertencia**: usar siempre **Text** — blanco falla contraste (1.92:1).

Si el proyecto responde a una obligación legal de accesibilidad (sistema público, servicio con requisito contractual), el nivel WCAG deja de ser preferencia de equipo y pasa a ser mínimo exigible — ver §11.4.

---

## 3. Spacing y tamaños

Escala en base 4px (Tailwind default) — no usar valores sueltos fuera de la escala.

| Token | Valor |
| --- | --- |
| `space-xs` | 4px |
| `space-sm` | 8px |
| `space-md` | 16px |
| `space-lg` | 24px |
| `space-xl` | 32px |

## 4. Radius, elevación y movimiento

| Token | Valor | Uso |
| --- | --- | --- |
| `radius-sm` | 6px | inputs, badges, sidebar buttons |
| `radius-md` | 8-10px | cards, botones, modales |
| `shadow-sm` | `0 2px 12px rgba(0,0,0,0.08)` | elevación baja (scroll-to-top) |
| `shadow-md` | `0 2px 12px rgba(0,0,0,0.22)` | elevación media (sidebar flotante) |
| `shadow-lg` | `0 4px 20px rgba(0,0,0,0.1)` | dropdowns, menus |
| `motion-fast` | 150ms | hover, toggle, transiciones de color |
| `motion-normal` | 220-250ms | apertura de sidebar, fade de ribbon |
| `motion-slow` | 300ms | transición de nav, scroll behavior |
| `easing-standard` | ease-out | curva por defecto |

Todo lo de esta fila de movimiento respeta `prefers-reduced-motion` (sección 8) — no animar si el usuario lo pide.

**Límites de movimiento que son criterio WCAG, no preferencia estética:**

| Criterio | Nivel | Qué prohíbe o exige |
| --- | --- | --- |
| 2.2.2 Pausar, detener, ocultar | A | contenido que se mueve, parpadea, se desplaza o se actualiza solo por más de **5 segundos** necesita control para pausarlo, detenerlo u ocultarlo — carruseles automáticos, tickers, marquesinas |
| 2.3.1 Tres destellos o menos | A | nada puede destellar **más de 3 veces por segundo**; es un criterio de seguridad, no de gusto: provoca convulsiones |
| 2.3.3 Animación por interacciones | AAA | la animación disparada por una interacción debe poder desactivarse, salvo que sea esencial |

`prefers-reduced-motion` es la implementación práctica de 2.3.3 y el mínimo decente aunque el proyecto apunte a AA. Reducir no siempre es eliminar: un *fade* corto suele ser aceptable donde un desplazamiento grande no lo es. El caso que más daño hace no es el botón que rebota, es el **parallax** y el movimiento de fondo a distinta velocidad: desencadena mareo, náusea y dolor de cabeza en personas con trastornos vestibulares.

## 5. Breakpoints

| Token | Ancho | Uso |
| --- | --- | --- |
| `bp-sm` | 700px | mobile → tablet (oculta sidebar flotante, dots del ribbon, footer grid a 1 columna) |
| `bp-md` | 960px | tablet → desktop (oculta nav burger, muestra nav desktop) |

---

## 6. Iconografía

Set de iconos: **Lucide** (`lucide-angular`). Es una decisión consciente de diseño: la estética de línea delgada (outline, stroke 1.75-2, strokeLinecap round) refuerza la identidad corporativa y limpia del panel administrativo.

- Color por defecto: **Text**.
- Estado activo / seleccionado: **Primary**.
- No mezclar estilos (outline + filled, o distintos grosores de trazo) dentro de la misma vista.
- **Ícono con significado necesita nombre accesible** (`aria-label` o texto visible): un botón que solo muestra 🗑 es "botón" para un lector de pantalla. Ícono puramente decorativo, al revés: `aria-hidden="true"` para que no ensucie la lectura.
- **Ícono que transmite información cumple 1.4.11: 3:1 de contraste** contra su fondo (§2.5). Un ícono gris claro decorativo puede ignorarlo; un ícono de estado o de acción, no.
- **Nunca solo color** para distinguir estado (criterio 1.4.1 Uso del color, nivel A): el ícono de error y el de éxito deben diferenciarse por forma, no únicamente por rojo/verde. Uno de cada doce hombres tiene deficiencia en la percepción del rojo-verde.
- Ícono nunca reemplaza al texto en acciones destructivas o poco frecuentes: ahí va etiqueta visible.

### 6.1 Mapeo icono → funcionalidad

| Icono | Componente | Funcionalidad |
| --- | --- | --- |
| `IconHome` | `home` | Dashboard / inicio, espacios comunes |
| `IconDollar` | `dollar` | Gastos comunes, precios |
| `IconMessage` | `message` | Tablón de avisos |
| `IconCalendar` | `calendar` | Reservas |
| `IconShield` | `shield` | Visitas (control de acceso) |
| `IconAlertTriangle` | `alert-triangle` | Incidentes |
| `IconCamera` | `camera` | Registro fotográfico |
| `IconPhone` | `phone` | Canales de comunicación, emergencia |
| `IconTrendingUp` | `trending-up` | Dashboard admin (métricas) |
| `IconMenu` | `menu` | Menú hamburguesa (mobile) |
| `IconX` | `x` | Cerrar modal / cancelar |
| `IconBell` | `bell` | Notificaciones y suscripción a avisos (Canales, Tablón) |
| `IconCheck` | `check` | Confirmación, ítem incluido en un plan (Gastos, Home, Precios, Registro, Tablón) |
| `IconChevronRight` | `chevron-right` | Navegación a detalle, lista expandible |
| `IconDownload` | `download` | Descarga de comprobante o reporte (Dashboard, Gastos, Registro) |
| `IconEye` | `eye` | Ver detalle / previsualizar (Dashboard, Registro) |
| `IconMail` | `mail` | Correo de contacto (Canales) |
| `IconPlus` | `plus` | Crear aviso nuevo (Tablón) |
| `IconTag` | `tag` | Categoría de gasto (Dashboard) |
| `IconUsers` | `users` | Comité, residentes, destinatarios (Canales, Registro, Tablón) |

---

## 7. Componentes

Por componente documentar: qué es, cuándo usarlo, estados, cómo se implementa.

**Antes de diseñar un componente interactivo desde cero, revisar el patrón en la [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/) del W3C.**

### Layout

- **Anatomía**: AnnouncementRibbon (fixed top, 32px) + Nav (fixed, 64px) + contenido principal + FloatingSidebar (fixed right) + Footer.
- **Uso**: wrapper de todas las rutas autenticadas. Gestiona rol, navegación responsive y scroll-to-top.
- **Estados**: nav transparente en home hasta scroll > 40px, luego `rgba(255,255,255,0.97)` con `backdrop-filter: blur(14px)`.
- **Accesibilidad**: nav con semantics `nav`, logo como `NavLink`, burger con `aria-label`.

### AnnouncementRibbon

- **Anatomía**: barra fija superior (32px, bg Accent) con badge "Tablón", texto rotativo y dots indicadores.
- **Uso**: mostrar avisos importantes. Rota cada 5s con fade transition (250ms).
- **Estados**: visible / oculto (botón dismiss). En mobile se ocultan los dots.
- **Accesibilidad**: `aria-label` en dots y botón cerrar.

### FloatingSidebar

- **Anatomía**: sidebar fijo a la derecha, 4 íconos de 40×40px con labels que se expanden en hover.
- **Uso**: acceso rápido a Reservar, Mis gastos, Emergencia, Tablón.
- **Estados**: default (solo ícono), hover (expande label con max-width 120px, transición 222ms).
- **Accesibilidad**: `Link` de react-router, touch target 40×40.

### Button (por implementar)

- **Anatomía**: label + ícono opcional.
- **Uso**: variante `primary` (Primary bg) para acción principal; `secondary` para alternativas.
- **Estados**: default, hover (Accent), focus (outline 2px Primary), disabled (opacity 40%), loading.
- **Accesibilidad**: rol `button`, alcanzable por teclado, `aria-disabled`, `aria-busy`.

### ProtectedRoute

- **Anatomía**: wrapper que valida `allowedRoles` contra el rol del contexto `useAuth`.
- **Uso**: proteger rutas que requieren roles específicos. Redirige a `/` si no autorizado.
- **Estados**: autorizado (renderiza children) / no autorizado (redirect).

### RouteError

- **Anatomía**: página de error global (`errorElement` del router).
- **Uso**: capturar errores de renderizado en rutas.

---

## 8. Accesibilidad

No se limita a contraste de color (sección 2.5) — cubrir también:

- **Teclado**: todo elemento interactivo alcanzable con `Tab`, orden lógico, sin trampas de foco.
- **Foco visible**: outline o equivalente en cada estado focus, nunca `outline: none` sin reemplazo.
- **Lectores de pantalla**: labels/`aria-label` en controles sin texto visible, `alt` en imágenes con significado, landmarks (`nav`, `main`, `header`).
- **Touch target**: mínimo 44×44px en controles táctiles. El piso legal de WCAG 2.2 es más bajo — **2.5.8 Tamaño del objetivo (mínimo), AA: 24×24 CSS px** (o espaciado equivalente) — y 44×44 corresponde a **2.5.5, nivel AAA**. Se adopta 44 igual porque coincide con las guías de plataforma: Apple HIG recomienda 44×44 pt y Material Design 48×48 dp. Cumplir 24×24 y quedarse ahí es cumplir la norma y entregar un control incómodo en móvil.
- **Movimiento**: respetar `prefers-reduced-motion` en animaciones no esenciales (tokens de sección 4).

Nivel objetivo: WCAG 2.2 AA — 2.2 es la recomendación W3C vigente (octubre de 2023). Usar 2.1 solo si el proyecto ya está comprometido con esa versión. Ajustar si el proyecto requiere AAA o tiene requisitos legales específicos (sector público chileno: ver §11.4).

Estado actual del proyecto:
- Algunos `aria-label` en botones del ribbon y sidebar.
- `prefers-reduced-motion` respetado en animaciones hero (fade, blob, gradient).
- Touch target mínimo 40×40px en sidebar flotante y nav links.
- `alt` / `aria-label` en íconos con significado.
- Falta: focus management completo, skip-to-content, testing con lector de pantalla.

**Los 9 criterios nuevos de WCAG 2.2** — un proyecto que venía de 2.1 y "ya cumplía" no cumple 2.2 hasta revisar estos, y cuatro son de diseño puro:

| Criterio | Nivel | Qué obliga a decidir en el diseño |
| --- | --- | --- |
| 2.4.11 Foco no oscurecido (mínimo) | AA | ningún header fijo, barra flotante ni cookie banner puede tapar el elemento que tiene el foco de teclado |
| 2.4.12 Foco no oscurecido (mejorado) | AAA | el elemento con foco queda completamente visible, no parcialmente |
| 2.4.13 Apariencia del foco | AAA | indicador de foco con área y contraste mínimos (equivalente a contorno de 2px, contraste ≥3:1 contra lo adyacente) |
| 2.5.7 Movimientos de arrastre | AA | toda acción de arrastrar (reordenar, slider, mapa) tiene alternativa con un solo puntero — clic, botones o campo de entrada |
| 2.5.8 Tamaño del objetivo (mínimo) | AA | objetivos táctiles de al menos 24×24 CSS px, o con espaciado equivalente. La regla de 44×44 de arriba es más estricta y satisface esta |
| 3.2.6 Ayuda consistente | A | los accesos a ayuda (chat, teléfono, FAQ) aparecen en el mismo lugar y en el mismo orden en todas las plantillas |
| 3.3.7 Entrada redundante | A | no volver a pedir un dato ya entregado en el mismo flujo: autocompletar o mostrarlo para confirmar |
| 3.3.8 Autenticación accesible (mínimo) | AA | ningún paso de login exige una prueba cognitiva (recordar, transcribir, resolver un puzzle) sin alternativa; permitir pegar y usar gestor de contraseñas |
| 3.3.9 Autenticación accesible (mejorada) | AAA | igual que 3.3.8, sin la excepción de reconocimiento de objetos |

Además, el criterio **4.1.1 Parsing quedó obsoleto y fue removido en 2.2** — si el checklist del proyecto todavía lo audita, sacarlo: dejó de ser criterio.

Accesibilidad y usabilidad son el atributo "Usabilidad" de ISO/IEC 25010 visto desde el diseño: si el proyecto declara esa norma, esta sección es donde se verifica — ver §11.1, y §11.4 para la obligación legal si aplica.

---

## 9. Aplicación por módulo

| Módulo | Ruta | Roles | Color dominante | Ícono principal |
| --- | --- | --- | --- | --- |
| Home | `/` | todos | Primary | `IconHome` |
| Mi panel (residente) | `/mi-dashboard` | residente | Primary | `IconTrendingUp` |
| Dashboard (admin) | `/dashboard` | admin | Primary | `IconTrendingUp` |
| Reservas | `/reservas` | residente, admin | Primary | `IconCalendar` |
| Gastos | `/gastos` | todos autenticados | Accent | `IconDollar` |
| Visitas | `/visitas` | todos | Primary → verde al confirmar | `IconShield` |
| Incidentes | `/incidentes` | todos | Alerta cuando activo | `IconAlertTriangle` |
| Tablón | `/tablon` | todos | neutral | `IconMessage` |
| Canales | `/canales` | todos | Alerta (emergencia) | `IconPhone` |
| Registro fotográfico | `/registro` | conserje, admin, comité | neutral | `IconCamera` |
| Espacios comunes | `/espacios` | todos autenticados | neutral | `IconHome` |
| Precios | `/precios` | admin | Accent | `IconDollar` |
| Login | `/login` | público | Primary | — |
| Crear cuenta | `/crear-cuenta` | público | Primary | — |

---

## 10. Gobierno y mantenimiento

- **Fuente de verdad**: código (tokens en `src/index.css`, valores hardcodeados en `src/components/Layout.tsx`). Los tokens Tailwind v4 en `@theme inline` son la fuente primaria; los valores en Layout.tsx (colores inline, breakpoints en `<style>`) son deuda técnica conocida. Si se adopta un archivo DTCG JSON para Figma/Tokens Studio en el futuro, la dirección de sincronización es Figma → código (diseño manda, código consume). Exportar desde los tokens CSS, no inventar un formato propio.
- **Dueño**: equipo de desarrollo Convivo. Aprueba cambios de token y la revisión de contraste antes del merge.
- **Cómo proponer un cambio**: PR a este archivo + revisión de contraste (§2.5) antes de mergear.
- **Qué cambio de token es breaking**: renombrar o eliminar un alias rompe a todo consumidor; cambiar el valor de un alias no rompe la API pero **sí puede romper el contraste** (§2.5) — cualquier cambio de valor de color exige recalcular los ratios antes de mergear, no después.
- **Versionado**: sin versionado formal del design system aún. Cuando se adopte, registrar semver del design system o versión del archivo de tokens, y changelog de cambios de token — un equipo de frontend no puede adoptar una versión que no puede nombrar.
- **Deprecación**: un token que se retira se marca como deprecado con reemplazo indicado antes de borrarse, no desaparece entre dos releases.
- Tratar como código: agregar sección cuando un patrón se repite 3+ veces, eliminar cuando ya no se usa. Revisar cada sprint o trimestral en equipos chicos.
- La normativa declarada en §11 entra en la misma cadencia: si cambia el alcance (el producto pasa a ser sistema público, empieza a mostrar datos personales en pantalla), revisar §11 en esa pasada, no en la auditoría.

---

## 11. Normativa y cumplimiento

Normas que aplican realmente a este proyecto: WCAG 2.2 AA + Leyes chilena (21.719 datos personales, 21.180 transformación digital, 20.422 discapacidad, Decreto N°1/2015 accesibilidad web). ISO/IEC 25010 y 27001 no se declaran formalmente pero sus principios guían las decisiones de diseño.

Acá va únicamente lo que el **diseño** decide o verifica. Los controles de implementación (backend, secretos, dependencias) viven en `AGENTS.md` §17 — si el proyecto tiene ambos archivos, esta sección referencia esa, no la duplica.

### 11.1 ISO/IEC 25010 — atributos que el diseño determina

| Atributo | Qué decide el diseño | Cómo se verifica |
| --- | --- | --- |
| Capacidad de interacción *(Usabilidad en 2011)* | jerarquía visual, accesibilidad, claridad del copy y de los errores | §8 completa + contraste §2.5 medido, no estimado — desglose por subcaracterística abajo |
| Compatibilidad | consistencia de la UI entre breakpoints, navegadores y modo claro/oscuro | revisión en Chrome, Edge y Firefox actuales + Safari iOS 16+, a 360 px (mobile), 768 px (tablet) y 1280 px (desktop) + §2.4 y §5 completas |
| Fiabilidad | estados de carga, error, vacío y offline diseñados, no improvisados en implementación | cada componente de §7 documenta esos estados; ninguno queda "por definir" |
| Seguridad | la interfaz no expone de más: datos enmascarados, sesión y permisos visibles, confirmación en acciones destructivas | §11.2 + revisión de pantallas que muestran datos sensibles |
| Mantenibilidad | tokens en 3 capas (§2), sin hex sueltos en componentes | `grep -rnE '#[0-9A-Fa-f]{3,8}' src --include='*.tsx'` para detectar hex sueltos fuera de `src/index.css`, más revisión en PR de diseño |

**Capacidad de interacción, subcaracterística por subcaracterística** — es el atributo que el diseño posee por completo, así que acá va desglosado. Las ocho son de ISO/IEC 25010:2023:

| Subcaracterística | Qué significa en la interfaz | Dónde se resuelve |
| --- | --- | --- |
| Reconocibilidad de la adecuación | el usuario entiende, al ver la pantalla, si le sirve para lo que vino a hacer | jerarquía tipográfica §1, copy de encabezados |
| Aprendibilidad | se puede usar sin manual la primera vez | patrones consistentes §7, iconografía estable §6 |
| Operabilidad | controles alcanzables y accionables por cualquier medio de entrada | §8: teclado, foco visible, touch target 44×44 |
| Protección contra errores de usuario | la interfaz previene el error antes de tener que perdonarlo | validación en línea, confirmación en acciones destructivas §11.2, deshacer donde exista |
| Involucramiento del usuario *(reemplaza "estética de la interfaz")* | la interfaz sostiene la atención sin recurrir a patrones oscuros | tokens de §2 y §4 aplicados con intención, no decoración |
| Inclusividad *(nueva 2023)* | personas con distintas capacidades, edades, idiomas y contextos pueden usarlo | WCAG §8 + revisión de lenguaje y de supuestos culturales en el copy |
| Asistencia al usuario | ayuda disponible donde y cuando se necesita | ubicación consistente de ayuda (WCAG 3.2.6), textos de error accionables |
| Autodescripción *(nueva 2023)* | la interfaz explica su propio estado sin que haya que adivinar | labels visibles, estados de carga/error/vacío §11.1, mensajes que dicen qué pasó y qué hacer |

La antigua subcaracterística *accesibilidad* de 2011 se dividió en **inclusividad** y **asistencia al usuario**: la accesibilidad dejó de ser un ítem al final de la lista y pasó a atravesar el atributo entero. **Portabilidad** pasó a **Flexibilidad** (+ escalabilidad) y **Safety** es característica nueva. Usar los nombres 2023 en informes y contratos.

Rendimiento no se decide acá pero el diseño lo condiciona: peso de tipografías, imágenes e ilustraciones, cantidad de animaciones simultáneas. Fijar presupuesto: peso máximo de fuentes ~150 KB (Gloock + Inter, ambas variable), LCP objetivo < 2.5s.

Complemento opcional: ISO 9241-210 (diseño centrado en el usuario) si el proyecto exige proceso iterativo con usuarios reales documentado — indicar dónde viven los hallazgos de investigación: `(no aplica: sin investigación con usuarios reales documentada)`.

### 11.2 ISO/IEC 27001 — qué le toca al diseño

La norma protege confidencialidad, integridad y disponibilidad de la información. Desde el diseño:

- **Confidencialidad**: enmascarar datos sensibles en pantalla por defecto (RUT, correo, tarjeta, dirección) y revelarlos solo por acción explícita; nunca usar datos personales reales en mockups, prototipos ni capturas de documentación — usar datos sintéticos.
- **Integridad**: acciones destructivas o irreversibles exigen confirmación diferenciada (no un `OK` genérico); el estado de guardado siempre visible, sin ambigüedad entre "guardado" y "pendiente".
- **Disponibilidad**: estados degradados diseñados (sin conexión, servicio caído, datos parciales) en vez de pantalla en blanco.

- **Derechos del titular**: si el producto trata datos personales, los derechos de acceso, rectificación, cancelación, oposición y **portabilidad** necesitan pantalla y flujo diseñados — no un correo a soporte. Incluye la descarga de los propios datos en formato reutilizable y la revocación del consentimiento con el mismo esfuerzo que costó otorgarlo.
- **Consentimiento**: separable por finalidad y revocable. Un único checkbox que agrupa todo no es consentimiento válido, y visualmente tampoco debe estar pre-marcado ni destacado frente a la opción de rechazar.

El resto de los controles 27001 (cifrado, control de acceso, log de auditoría, respaldo) es implementación — ver `AGENTS.md` §17.2, que además mapea los controles concretos del Anexo A (A.8.11 enmascaramiento, A.8.10 eliminación, A.8.3 restricción de acceso).

### 11.3 ISO 9001 / IEEE 730 / ISO/IEC/IEEE 29119 — proceso y pruebas de interfaz

- **ISO 9001:2015** (gestión de calidad): procesos consistentes y mejora continua. Acá se materializa en §10 (fuente de verdad, dueño, cómo proponer un cambio de token) — sin dueño definido, no hay proceso que certificar. Revisión ISO 9001:2026 en curso (publicación esperada para fines de 2026, 3 años de transición): confirmar edición antes de citarla.
- **IEEE 730** (procesos de aseguramiento de calidad de software): edición vigente **730-2026**, reemplaza a 730-2014. Si el proyecto exige plan formal, indicar qué parte de este documento lo satisface y dónde vive el plan: `(no aplica: sin plan formal de calidad exigido)`.
- **ISO/IEC/IEEE 29119** (pruebas; partes **-1:2022, -2:2021, -3:2021, -4:2021, -5:2024**): aplica igual a la interfaz — casos de prueba de accesibilidad (teclado, lector de pantalla, contraste) y de regresión visual documentados, con registro de ejecución y de defectos. Artefactos: `(sin proceso formal 29119)` — las pruebas de accesibilidad son manuales y sin registro documentado; los casos automatizados viven en `src/**/*.test.tsx`.

### 11.4 Cruce con normativa chilena

| Norma / criterio | Ley chilena | Punto de cruce | Qué exige en este documento |
| --- | --- | --- | --- |
| WCAG | **Decreto Supremo N°1 de 2015 (MINSEGPRES)** — norma técnica sobre sistemas y sitios web de los órganos de la Administración del Estado, vigente | obliga a los sitios del Estado (municipalidades incluidas) a cumplir el estándar de accesibilidad del W3C, hoy leído como **WCAG 2.2** | nivel WCAG de §8 declarado como mínimo obligatorio, no aspiracional; §2.5 con ratios medidos, no estimados |
| Capacidad de interacción (ISO/IEC 25010) | Ley 21.180 (transformación digital del Estado; vigente desde el 9-06-2022, aplicación gradual por servicio hasta el 31-12-2027) | tramitación 100% electrónica: accesibilidad e interoperabilidad de sistemas públicos dejan de ser recomendación | flujos completos utilizables por teclado y lector de pantalla, no solo pantallas sueltas conformes |
| WCAG (accesibilidad como derecho) | Ley 20.422 (2010, igualdad de oportunidades e inclusión social de personas con discapacidad) | acceso a la información y a la comunicación en igualdad de condiciones, con diseño universal y régimen sancionatorio | §8 completa: teclado, foco visible, lector de pantalla, touch target |
| ISO/IEC 27001 | Ley 19.628, sustituida en lo sustantivo por la **Ley 21.719** (publicada 13-12-2024, entrada en force original: **1-12-2026** — posibles postergación a 2027 por demora en conformación de la Agencia de Protección de Datos Personales, APDP) | minimización y resguardo de datos personales también en la capa visible | §11.2: enmascarado por defecto, datos sintéticos en mockups, consentimiento explícito y separable en formularios que recolectan datos |
| ISO 9001 | CMF **NCG 519** (2024, modifica NCG 461) — introduce NIIF S1/S2 obligatorias desde ejercicio 2026 (reporte 2027), exige 60% diversidad de género en ternas a directorio, amplía métricas SASB y verifica externa; entidades con <1M UF de activos quedan exentas de memoria integrada | trazabilidad y reportabilidad se apoyan en procesos de calidad certificables | §10 con dueño definido y el historial de git de este archivo como registro de cambios de token (sin changelog separado aún) |
| ISO/IEC 27001 | **Ley 21.459** (delitos informáticos; vigente desde 20-06-2022, reemplazó Ley 19.223) | responsabilidad penal de la empresa por delitos informáticos; alineación con Convenio de Budapest | §11.2: confirmación en acciones destructivas, logs de auditoría atribuibles en UI |
| ISO/IEC 25010 | **Ley 21.643** (Ley Karin; vigente desde 01-08-2024) | prevención y sanción de acoso laboral y sexual; protocolo de denuncia | si el proyecto maneja datos de RRHH o tiene canales de comunicación internos: flujos de denuncia con protección del denunciante, plazo de investigación (30 días hábiles) |
| ISO/IEC 27001 | **Ley 21.663** (marco de ciberseguridad; vigente) | protección de infraestructura crítica | si el proyecto es infraestructura crítica: UI de monitoreo de seguridad, alertas, dashboards operacionales |

Dos plazos que ya corren, no son hipotéticos: la Ley 21.719 tiene entrada en force original el **1-12-2026** (crea la Agencia de Protección de Datos Personales, con multas de hasta $1.400 millones por infracción grave o 4% de los ingresos anuales, y obligación de notificar brechas), pero **la APDP aún no está operativa** — el gobierno evalúa postergar la entrada en force hasta 2027 por demora en la conformación del Consejo Directivo. Verificar fecha vigente antes de planificar. La gradualidad de la Ley 21.180 termina el **31-12-2027**. El trabajo de diseño que dependa de ellos se planifica antes de esas fechas.

Verificar la versión exacta de la norma técnica del Decreto N°1 antes de citarla como requisito contractual: el decreto es de 2015 pero su exigencia de accesibilidad apunta al estándar W3C vigente, que se actualizó a WCAG 2.2 — el nivel exigible cambia sin que cambie el número del decreto.

Si el proyecto no opera en Chile, dejar `(no aplica: <jurisdicción>)` y, si corresponde, la norma equivalente de esa jurisdicción — no borrar la tabla.

Esta tabla es orientación técnica de implementación, no asesoría legal: el alcance real de cada ley sobre este proyecto lo define el área legal, no el equipo de diseño ni el agente.

---

## 12. Referencias

Del proyecto:

- `src/index.css` — tokens de color y tipografía (Tailwind v4 `@theme inline`)
- `src/components/Layout.tsx` — componentes principales con valores hardcodeados
- `src/components/icons/Icons.tsx` — set de iconos SVG custom
- `src/routes/router.tsx` — rutas y módulos

Canónicas (no reemplazar por blogs que las resumen — cuando hay duda sobre un criterio, gana el texto de W3C):

- WCAG 2.2 — recomendación W3C, octubre de 2023: <https://www.w3.org/TR/WCAG22/>
- Novedades de WCAG 2.2 (los 9 criterios de §8): <https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/>
- ARIA Authoring Practices Guide, patrones de componentes (§7): <https://www.w3.org/WAI/ARIA/apg/patterns/>
- Design Tokens Format Module, DTCG (§2): <https://www.designtokens.org/tr/drafts/format/>
- Verificador de contraste (§2.5): <https://webaim.org/resources/contrastchecker/>
