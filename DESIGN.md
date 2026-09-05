# PanelAdmin (Convivo) — Design System

Sistema de diseño del panel de administración de Convivo, plataforma de gestión de condominios. Referencia de tipografía, color, spacing, iconografía, componentes y accesibilidad para diseño e implementación frontend.

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

**Estado actual del código — el modelo de arriba es el objetivo, no lo implementado.** `src/styles.css` define solo tokens de tipografía (`--font-sans`, `--font-serif`) dentro de `@theme`; **no hay ningún token de color**. Los cuatro colores de §2.1 viven como hex literales en clases arbitrarias de Tailwind (`bg-[#0D9488]`, `text-[#00201B]`…): ~189 ocurrencias repartidas en 11 archivos de `src/app` — `#00201B` ×61, `#E2E8F0` ×60, `#0D9488` ×53, `#005047` ×14, `#E11D48` ×1. Los de §2.3 (Advertencia, Éxito) no aparecen en el código en absoluto.

Consecuencia práctica: cambiar Primary hoy es un find-and-replace sobre 53 ocurrencias, no la edición de una línea, y la regla "sin hex sueltos en componentes" de §11.1 está declarada pero incumplida. Migración pendiente: mover los alias de §2.1 a variables `@theme` en `styles.css` (`--color-primary`, `--color-text`, `--color-border`, `--color-accent`) y reemplazar las clases arbitrarias por las utilidades que Tailwind genera de esas variables.

**Formato de intercambio**: si los tokens viven en un archivo y no solo en la cabeza del equipo, usar el formato del **Design Tokens Community Group (DTCG)** del W3C — primera versión estable (2025.10) publicada en octubre de 2025, respaldada por Adobe, Figma, Google, Microsoft, Shopify y Salesforce. Lo leen o escriben Figma, Penpot, Sketch, Tokens Studio, Style Dictionary y Terrazzo, así que un token definido una vez viaja entre diseño y código sin script de exportación a medida. Elegir ese JSON antes que inventar un formato propio: la diferencia aparece el día que se cambia de herramienta. (no aplica: tokens solo en código, sin archivo DTCG).

### 2.1 Tokens base (global + alias)

| Token | Hex | RGB | CMYK | Uso |
| --- | --- | --- | --- | --- |
| Background | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | Fondo general de la aplicación |
| Text | `#00201B` | 0, 32, 27 | 100, 0, 16, 87 | Texto principal sobre fondos claros |
| Primary | `#0D9488` | 13, 148, 136 | 91, 0, 8, 42 | Acciones principales, botones, enlaces activos |
| Accent | `#005047` | 0, 80, 71 | 100, 0, 11, 69 | Estados hover/presionado, énfasis secundario |
| Surface | `#FFFFFF` | 255, 255, 255 | 0, 0, 0, 0 | Tarjetas, paneles, modales |
| Border | `#E2E8F0` | 226, 232, 240 | 6, 3, 0, 6 | Bordes, separadores, líneas divisorias |
| Muted | `#64748B` | 100, 116, 139 | 28, 17, 0, 45 | Texto secundario, labels desactivados |

### 2.2 Tokens de componente (opcional)

| Token | Referencia | Uso |
| --- | --- | --- |
| `button-primary-bg` | Primary | Fondo botón principal |
| `input-border-focus` | Primary | Borde de input en foco |
| `card-surface` | Surface | Fondo de tarjetas |

### 2.3 Colores de estado (semánticos)

| Token | Hex | Uso |
| --- | --- | --- |
| Alerta | `#E11D48` | Estados críticos/urgentes |
| Advertencia | `#EAB308` | Estados pendientes o parciales |
| Éxito | `#16A34A` | Estados confirmados, "OK" |

### 2.4 Dark mode

(no aplica: sin dark mode actual en el proyecto)

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

Escala en base 4px (coherente con Tailwind defaults) — no usar valores sueltos fuera de la escala.

| Token | Valor |
| --- | --- |
| `space-xs` | 4px |
| `space-sm` | 8px |
| `space-md` | 16px |
| `space-lg` | 24px |
| `space-xl` | 32px |

## 4. Radius, elevación y movimiento (opcional)

| Token | Valor | Uso |
| --- | --- | --- |
| `radius-sm` | 6px | inputs, badges, sidebar buttons |
| `radius-md` | 8-10px | cards, botones, modales |
| `shadow-sm` | Tailwind `shadow-sm` | elevación baja (dropdown) |
| `shadow-md` | Tailwind `shadow` | elevación media (modal) |
| `motion-fast` | 150ms | hover, toggle |
| `motion-slow` | 300ms | apertura de modal, transición de página |
| `easing-standard` | `ease-out` | curva por defecto |

Todo lo de esta fila de movimiento respeta `prefers-reduced-motion` (sección 8) — no animar si el usuario lo pide.

**Límites de movimiento que son criterio WCAG, no preferencia estética:**

| Criterio | Nivel | Qué prohíbe o exige |
| --- | --- | --- |
| 2.2.2 Pausar, detener, ocultar | A | contenido que se mueve, parpadea, se desplaza o se actualiza solo por más de **5 segundos** necesita control para pausarlo, detenerlo u ocultarlo — carruseles automáticos, tickers, marquesinas |
| 2.3.1 Tres destellos o menos | A | nada puede destellar **más de 3 veces por segundo**; es un criterio de seguridad, no de gusto: provoca convulsiones |
| 2.3.3 Animación por interacciones | AAA | la animación disparada por una interacción debe poder desactivarse, salvo que sea esencial |

`prefers-reduced-motion` es la implementación práctica de 2.3.3 y el mínimo decente aunque el proyecto apunte a AA. Reducir no siempre es eliminar: un *fade* corto suele ser aceptable donde un desplazamiento grande no lo es. El caso que más daño hace no es el botón que rebota, es el **parallax** y el movimiento de fondo a distinta velocidad: desencadena mareo, náusea y dolor de cabeza en personas con trastornos vestibulares.

## 5. Breakpoints

El panel principal es desktop-only. Solo la pantalla de login usa responsive design.

| Token | Ancho | Uso |
| --- | --- | --- |
| `lg` | 1024px | Login: sidebar decorativa visible/oculta |

---

## 6. Iconografía

Set de iconos: **Lucide Angular**, estilo outline/line.

- Color por defecto: **Text**.
- Estado activo / seleccionado: **Primary**.
- No mezclar estilos (outline + filled, o distintos grosores de trazo) dentro de la misma vista.
- **Ícono con significado necesita nombre accesible** (`aria-label` o texto visible): un botón que solo muestra un ícono es "botón" para un lector de pantalla. Ícono puramente decorativo, al revés: `aria-hidden="true"` para que no ensucie la lectura.
- **Ícono que transmite información cumple 1.4.11: 3:1 de contraste** contra su fondo (§2.5). Un ícono gris claro decorativo puede ignorarlo; un ícono de estado o de acción, no.
- **Nunca solo color** para distinguir estado (criterio 1.4.1 Uso del color, nivel A): el ícono de error y el de éxito deben diferenciarse por forma, no únicamente por rojo/verde.
- Ícono nunca reemplaza al texto en acciones destructivas o poco frecuentes: ahí va etiqueta visible.

### 6.1 Mapeo icono → funcionalidad

| Icono | Funcionalidad |
| --- | --- |
| `home` | Dashboard / inicio |
| `users` | Usuarios y roles |
| `building-2` | Condominios / unidades |
| `search` | Espacios comunes |
| `calendar` | Reservas |
| `settings` | Configuración de cuenta |
| `dollar-sign` | Gastos comunes (próximamente) |
| `message-square` | Tablón de avisos (próximamente) |
| `camera` | Registro fotográfico (próximamente) |
| `target` | Incidentes (próximamente) |
| `bell` | Notificaciones (próximamente) |
| `lock` | Seguridad / candado |
| `log-out` | Cerrar sesión |
| `plus` | Agregar nuevo elemento |
| `check` | Confirmación |
| `x` | Cerrar modal / cancelar |
| `shield` | Visitas (control de acceso) |
| `alert-triangle` | Incidentes |
| `phone` | Canales de comunicación, emergencia |
| `trending-up` | Dashboard admin (métricas) |
| `download` | Descarga de comprobante o reporte |
| `eye` | Ver detalle / previsualizar |
| `mail` | Correo de contacto |
| `tag` | Categoría de gasto |

---

## 7. Componentes

Por componente documentar: qué es, cuándo usarlo, estados, cómo se implementa.

**Antes de diseñar un componente interactivo desde cero, revisar el patrón en la [ARIA Authoring Practices Guide (APG)](https://www.w3.org/WAI/ARIA/apg/patterns/) del W3C.** Trae implementación de referencia, modelo de teclado y marcado ARIA requerido para diálogo, combobox, tabs, acordeón, menú, árbol, grid, carrusel y una docena más.

Regla de teclado general de la APG: `Tab`/`Shift+Tab` entra y sale del widget; **dentro** del widget se navega con flechas. Un menú con seis opciones no debe consumir seis tabulaciones.

**Estados obligatorios por componente** — si alguno queda "por definir" en el diseño, se improvisa en implementación: default, hover, focus (visible, §8), active/pressed, disabled, loading, error, y los estados de datos: vacío, parcial, sin conexión.

### StatusBadge

- **Anatomía**: `<span>` con fondo semántico, texto de color, borde sutil, padding `px-2.5 py-0.5`, radius `rounded-full`.
- **Uso**: mostrar estado de una entidad (activo, inactivo, confirmada, pendiente, cancelada, moroso, habilitado, en mantención, vacío).
- **Estados visuales**: mapeados por nombre de estado en el mapa `STYLES` — cada estado tiene combinación bgColor/textColor/borderColor.
- **Accesibilidad**: texto legible, contraste AA garantizado por los colores elegidos.
- **Código**: `src/app/shared/status-badge.ts` — componente standalone con `input.required<string>()` y `computed` para la clase CSS.

### RoleBadge

- **Anatomía**: idéntica a StatusBadge — `<span>` con fondo semántico, padding `px-2.5 py-0.5`, radius `rounded-full`.
- **Uso**: mostrar rol de un usuario (Administrador, Comité, Conserje, Propietario, Residente).
- **Estados visuales**: mapeados por nombre de rol en el mapa `STYLES` — cada rol tiene su color.
- **Accesibilidad**: texto legible, contraste AA.
- **Código**: `src/app/shared/role-badge.ts` — componente standalone con `input.required<string>()`.

### Toggle

- **Anatomía**: botón con `role="switch"`, knob deslizante, fondo cambia entre Primary y gris.
- **Uso**: alternar un valor booleano (activo/inactivo, habilitado/deshabilitado).
- **Estados**: off (bg-gray-200, knob izquierda), on (bg-Primary, knob derecha), focus (ring-2 focus:ring-Primary).
- **Accesibilidad**: `role="switch"`, `aria-checked` dinámico, focus visible con ring, transición `duration-200`.
- **Código**: `src/app/shared/toggle.ts` — standalone con `input(false)` y `output<void>()`.

### FieldInput

- **Anatomía**: label + input, padding `py-2.5 px-3.5`, border `border-Border`, radius `rounded-lg`.
- **Uso**: campo de formulario genérico con label.
- **Estados**: default (bg-white), disabled (bg-gray-50, cursor-not-allowed), focus (ring-2 focus:ring-teal-100, border-Primary).
- **Accesibilidad**: label asociado al input, focus visible, contraste de texto AA.
- **Código**: `src/app/shared/field-input.ts` — standalone con `input.required<string>()` para label, `input<string>()` para defaultValue, `input(false)` para disabled.

---

## 8. Accesibilidad

No se limita a contraste de color (sección 2.5) — cubrir también:

- **Teclado**: todo elemento interactivo alcanzable con `Tab`, orden lógico, sin trampas de foco.
- **Foco visible**: outline o equivalente en cada estado focus, nunca `outline: none` sin reemplazo.
- **Lectores de pantalla**: labels/`aria-label` en controles sin texto visible, `alt` en imágenes con significado, landmarks (`nav`, `main`, `header`).
- **Touch target**: mínimo 44×44px en controles táctiles. El piso legal de WCAG 2.2 es más bajo — **2.5.8 Tamaño del objetivo (mínimo), AA: 24×24 CSS px** (o espaciado equivalente) — y 44×44 corresponde a **2.5.5, nivel AAA**. Se adopta 44 igual porque coincide con las guías de plataforma: Apple HIG recomienda 44×44 pt y Material Design 48×48 dp. Cumplir 24×24 y quedarse ahí es cumplir la norma y entregar un control incómodo en móvil.
- **Movimiento**: respetar `prefers-reduced-motion` en animaciones no esenciales (tokens de sección 4).

Nivel objetivo: WCAG 2.2 AA — 2.2 es la recomendación W3C vigente (octubre de 2023). Obligatorio para sistemas públicos en Chile (Decreto N°1/2015, ver §11.4).

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

| Módulo | Ruta | Color dominante | Ícono principal |
| --- | --- | --- | --- |
| Dashboard / Inicio | `/dashboard` | Primary (teal) | `home` |
| Usuarios y roles | `/users` | neutral (text) | `users` |
| Condominios y unidades | `/condominios` | neutral (text) | `building-2` |
| Espacios comunes | `/espacios` | neutral (text) | `search` |
| Reservas | `/reservas` | neutral (text) | `calendar` |
| Configuración | `/config` | neutral (text) | `settings` |
| Login | `/login` | Primary (teal) + Text (dark) | `lock` |

---

## 10. Gobierno y mantenimiento

- **Fuente de verdad**: código. Tipografía en `src/styles.css` (`@theme`); color todavía en hex literales dentro de las plantillas — hasta que se complete la migración de §2, la fuente de verdad del color es este documento, no el código. No hay Figma separado.
- **Dueño**: equipo de desarrollo Convivo.
- **Cómo proponer un cambio**: PR a este archivo + revisión de diseño antes de mergear.
- **Qué cambio de token es breaking**: renombrar o eliminar un alias rompe a todo consumidor; cambiar el valor de un alias no rompe la API pero **sí puede romper el contraste** (§2.5) — cualquier cambio de valor de color exige recalcular los ratios antes de mergear, no después.
- **Versionado**: sin versionado formal del design system — los tokens se actualizan directamente en código.
- **Deprecación**: un token que se retira se marca como deprecado con reemplazo indicado antes de borrarse, no desaparece entre dos releases.
- Tratar como código: agregar sección cuando un patrón se repite 3+ veces, eliminar cuando ya no se usa. Revisar cada sprint o trimestral en equipos chicos.
- La normativa declarada en §11 entra en la misma cadencia: si cambia el alcance (el producto pasa a ser sistema público, empieza a mostrar datos personales en pantalla), revisar §11 en esa pasada, no en la auditoría.

---

## 11. Normativa y cumplimiento

Normas que aplican realmente a este proyecto: WCAG 2.2 AA + Decreto N°1/2015 (MINSEGPRES) + Ley 21.719 (datos personales), Ley 21.180 (transformación digital), Ley 20.422 (discapacidad). ISO/IEC 25010 y 27001 no se declaran formalmente pero sus principios guían las decisiones de diseño.

Acá va únicamente lo que el **diseño** decide o verifica. Los controles de implementación (backend, secretos, dependencias) viven en `AGENTS.md` §17 — si el proyecto tiene ambos archivos, esta sección referencia esa, no la duplica.

### 11.1 ISO/IEC 25010 — atributos que el diseño determina

| Atributo | Qué exige en este proyecto | Cómo se verifica |
| --- | --- | --- |
| Capacidad de interacción *(era Usabilidad)* | jerarquía visual, accesibilidad, claridad del copy y de los errores | §8 completa + contraste §2.5 medido, no estimado — desglose por subcaracterística abajo |
| Compatibilidad | consistencia de la UI entre breakpoints y navegadores | revisión en navegadores objetivo + §5 completa |
| Fiabilidad | estados de carga, error, vacío y offline diseñados, no improvisados en implementación | cada componente de §7 documenta esos estados; ninguno queda "por definir" |
| Seguridad | la interfaz no expone de más: datos enmascarados, sesión y permisos visibles, confirmación en acciones destructivas | §11.2 + revisión de pantallas que muestran datos sensibles |
| Mantenibilidad | tokens en 3 capas (§2), sin hex sueltos en componentes | `grep -rnE '#[0-9A-Fa-f]{3,8}' src --include='*.ts'` para detectar hex sueltos fuera de `src/styles.css`, más revisión en PR de diseño |

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
- **IEEE 730** (procesos de aseguramiento de calidad de software): edición vigente **730-2026**, reemplaza a 730-2014. Si el proyecto exige plan formal, indicar qué parte de este documento lo satisface y dónde vive el plan: (no aplica: sin plan formal exigido).
- **ISO/IEC/IEEE 29119** (pruebas; partes **-1:2022, -2:2021, -3:2021, -4:2021, -5:2024**): aplica igual a la interfaz — casos de prueba de accesibilidad (teclado, lector de pantalla, contraste) y de regresión visual documentados, con registro de ejecución y de defectos. Artefactos: (no aplica: sin registro formal de casos de prueba de interfaz).

### 11.4 Cruce con normativa chilena (opcional — solo si el proyecto opera en Chile)

| Norma / criterio | Ley chilena | Punto de cruce | Qué exige en este documento |
| --- | --- | --- | --- |
| WCAG | **Decreto Supremo N°1 de 2015 (MINSEGPRES)** — norma técnica sobre sistemas y sitios web de los órganos de la Administración del Estado, vigente | obliga a los sitios del Estado (municipalidades incluidas) a cumplir el estándar de accesibilidad del W3C, hoy leído como **WCAG 2.2** | nivel WCAG de §8 declarado como mínimo obligatorio, no aspiracional; §2.5 con ratios medidos, no estimados |
| Capacidad de interacción (ISO/IEC 25010) | Ley 21.180 (transformación digital del Estado; vigente desde el 9-06-2022, aplicación gradual por servicio hasta el 31-12-2027) | tramitación 100% electrónica: accesibilidad e interoperabilidad de sistemas públicos dejan de ser recomendación | flujos completos utilizables por teclado y lector de pantalla, no solo pantallas sueltas conformes |
| WCAG (accesibilidad como derecho) | Ley 20.422 (2010, igualdad de oportunidades e inclusión social de personas con discapacidad) | acceso a la información y a la comunicación en igualdad de condiciones, con diseño universal y régimen sancionatorio | §8 completa: teclado, foco visible, lector de pantalla, touch target |
| ISO/IEC 27001 | Ley 19.628, sustituida en lo sustantivo por la **Ley 21.719** (publicada 13-12-2024, entrada en force original: **1-12-2026** — posibles postergación a 2027 por demora en conformación de la Agencia de Protección de Datos Personales, APDP) | minimización y resguardo de datos personales también en la capa visible | §11.2: enmascarado por defecto, datos sintéticos en mockups, consentimiento explícito y separable en formularios que recolectan datos |
| ISO 9001 | CMF **NCG 519** (2024, modifica NCG 461) — introduce NIIF S1/S2 obligatorias desde ejercicio 2026 (reporte 2027), exige 60% diversidad de género en ternas a directorio, amplía métricas SASB y verifica externa; entidades con <1M UF de activos quedan exentas de memoria integrada | trazabilidad y reportabilidad se apoyan en procesos de calidad certificables | §10 con dueño y registro de cambios de token en el historial de git de este archivo |
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

- `src/styles.css` — tokens de tipografía (`@theme`); aún sin tokens de color, ver nota de estado en §2
- `src/app/shared/` — componentes compartidos (StatusBadge, RoleBadge, Toggle, FieldInput)
- Lucide Angular — librería de iconos (`lucide-angular`)
- WCAG 2.2 AA + Decreto N°1/2015 (MINSEGPRES) — normativa de accesibilidad

Canónicas (no reemplazar por blogs que las resumen — cuando hay duda sobre un criterio, gana el texto de W3C):

- WCAG 2.2 — recomendación W3C, octubre de 2023: <https://www.w3.org/TR/WCAG22/>
- Novedades de WCAG 2.2 (los 9 criterios de §8): <https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/>
- ARIA Authoring Practices Guide, patrones de componentes (§7): <https://www.w3.org/WAI/ARIA/apg/patterns/>
- Design Tokens Format Module, DTCG (§2): <https://www.designtokens.org/tr/drafts/format/>
- Verificador de contraste (§2.5): <https://webaim.org/resources/contrastchecker/>
