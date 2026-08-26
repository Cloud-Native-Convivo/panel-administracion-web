# Convivo Admin — AGENTS.md

Guía de referencia para agentes de código que trabajen en este repositorio.
Describe el estado **real y actual** del código. Las secciones marcadas **PENDIENTE** reflejan deuda documentada, no funcionalidad implementada.

Sin emojis en código, PR, docs generadas ni output — usar solo como último recurso si no existe alternativa real, nunca como decoración por defecto.

---

## 0. Jerarquía de reglas

1. **Seguridad y corrección** — nunca introducir XSS, injection, o lógica de autenticación rota. Un bug de seguridad cancela cualquier otra prioridad.
2. **Convenciones del proyecto** — respetar componentes standalone + signals, Tailwind con hex inline ya usado, y el sistema de diseño (`DESIGN.md`).
3. **Minimalismo (Ponytail)** — no agregar abstracciones, dependencias ni carpetas que el código no necesite hoy. Tres líneas similares son preferibles a una abstracción prematura.

Secciones no aplicables a este proyecto: no hay pipeline de deploy propio (§13 se omite), no es monorepo (§14 se omite).

---

## 1. Resumen del proyecto

**Convivo Admin** es el panel de administración web de la plataforma Convivo (gestión de condominios residenciales en Chile). Permite a administradores gestionar usuarios/roles, condominios y unidades, espacios comunes y reservas. Es el contraparte administrativo de `Frontend-CloudNative` (portal de residentes) — mismo sistema de diseño, stack distinto (Angular vs React).

**Estado actual: prototipo de UI sin backend.** Todos los datos vienen de `src/app/data/sample-data.ts`; no hay llamadas HTTP, autenticación real, ni persistencia.

### Pantallas implementadas

| Ruta | Componente | Notas |
| --- | --- | --- |
| `/login` | `Login` | Mock: no valida credenciales, `login()` navega directo a `/dashboard` |
| `/dashboard` | `Dashboard` | Inicio |
| `/users` | `Users` | Usuarios y roles |
| `/condominios` | `Condominios` | Condominios y unidades |
| `/espacios` | `Espacios` | Espacios comunes |
| `/reservas` | `Reservas` | Reservas |
| `/config` | `Config` | Configuración de cuenta |
| `**` | — | Redirige a `''` (→ `/dashboard`) |

Módulos en el nav como "próximamente" (sin ruta ni componente, solo entrada visual en `shell.ts` `SOON_ITEMS`): Gastos comunes, Tablón de avisos, Registro fotográfico, Incidentes, Notificaciones.

---

## 2. Stack técnico

### Entorno

- **Angular** ^21.2.0 (standalone components, sin `NgModule`)
- **TypeScript** ~5.9.2
- **npm** (`packageManager: "npm@11.6.2"` en `package.json`)

### Dependencias de runtime

| Paquete | Versión | Uso |
| --- | --- | --- |
| `@angular/core`, `common`, `compiler`, `forms`, `platform-browser`, `router` | ^21.2.0 | Framework |
| `lucide-angular` | ^1.0.0 | Íconos (ver `DESIGN.md` §6) |
| `rxjs` | ~7.8.0 | Requerido por Angular (sin uso propio observado fuera del framework) |
| `tslib` | ^2.3.0 | Helpers TS |

### Dependencias de desarrollo

| Paquete | Uso |
| --- | --- |
| `@angular/build`, `@angular/cli`, `@angular/compiler-cli` | Build/CLI |
| `tailwindcss` + `@tailwindcss/postcss` | CSS utility framework (vía PostCSS, no plugin Vite — este proyecto no usa Vite) |
| `postcss` | Requerido por `@tailwindcss/postcss` |
| `prettier` | Formatter (con `parser: angular` para `.html`, ver `.prettierrc`) |
| `typescript` | ~5.9.2 |

### Lo que deliberadamente NO hay

- Sin ESLint configurado (no existe `eslint.config.js` ni similar) — único gate de estilo es `prettier`.
- Sin testing configurado y funcionando: `tsconfig.spec.json` existe pero `angular.json` **no tiene target `test`** en el proyecto `panel-admin`, y no hay ningún archivo `*.spec.ts`. El comando `ng test` del README no corre sin configurar antes el builder de test (Vitest, según Angular 21 default).
- Sin CI/CD (no existe carpeta `.github/`).
- Sin backend/API real — `src/app/data/sample-data.ts` es la única fuente de datos.
- Sin autenticación real — `Login.login()` navega directo, sin validar nada.
- Sin route guards — todas las rutas bajo `Shell` son accesibles sin restricción de rol.
- Sin gestor de estado (NgRx, Signals store, etc.) — solo `signal`/`computed`/`input`/`output` locales por componente.
- Sin `tailwind.config.js` — Tailwind v4 se configura vía `@theme` en `src/styles.css` (por ahora solo tipografía, ver `DESIGN.md` §1) + `.postcssrc.json`.

---

## 3. Estructura del proyecto

```text
src/
├── main.ts                  # bootstrapApplication(App, appConfig)
├── styles.css                # import Tailwind + @theme (fuentes) + estilos globales
├── index.html
└── app/
    ├── app.ts                 # componente raíz, solo <router-outlet>
    ├── app.routes.ts          # definición de rutas (sin guards)
    ├── app.config.ts          # providers: router + error listeners
    ├── layout/
    │   ├── shell.ts            # nav lateral, título por ruta, logout
    │   └── shell.html
    ├── screens/                # un componente por ruta (login, dashboard, users, condominios, espacios, reservas, config)
    │   └── *.ts + *.html       # cada screen separa lógica (.ts) de template (.html)
    ├── shared/                 # componentes reutilizables entre screens
    │   ├── status-badge.ts     # badge de estado (activo/pendiente/moroso/...)
    │   ├── role-badge.ts       # badge de rol (Administrador/Comité/...)
    │   ├── toggle.ts           # switch on/off
    │   └── field-input.ts      # input con label
    └── data/
        └── sample-data.ts      # datos estáticos + tipos (UserEntry, ReservationEntry, EspacioEntry, UnitEntry, ...)
```

Cada screen sigue el patrón `nombre.ts` (lógica, `@Component` con `templateUrl`) + `nombre.html` (template). No hay archivos de estilos por componente — todo es Tailwind inline.

---

## 4. Comandos

```bash
# instalar
npm install
# levantar entorno local (dev server, HMR)
ng serve
# build de producción
ng build
# test — NO FUNCIONAL hoy, falta target "test" en angular.json (ver §2 y §7)
ng test
```

No hay comando de test acotado a un archivo posible porque no hay testing configurado.

---

## 5. Estilo de código

### TypeScript / Angular

- **Standalone components únicamente** — `imports: [...]` directo en `@Component`, nunca `NgModule`.
- **Signals para estado**: `signal()`, `computed()`, `input()`/`input.required()`, `output()`. No usar `@Input()`/`@Output()` decorators clásicos ni `BehaviorSubject` para estado de componente.
- Lógica en `.ts`, template en `.html` separado (`templateUrl`) — excepción: componentes triviales de `shared/` (`status-badge.ts`, `role-badge.ts`, `toggle.ts`) usan `template: \`...\`` inline porque son de una sola línea de JSX-like. Seguir ese criterio: template inline solo si cabe en pocas líneas.
- Comillas simples, indentación 2 espacios (`.editorconfig` + `.prettierrc`).

```ts
// patrón real: src/app/shared/status-badge.ts
@Component({
  selector: 'app-status-badge',
  template: `<span [class]="cls()">{{ status() }}</span>`,
})
export class StatusBadge {
  readonly status = input.required<string>();
  readonly cls = computed(() => /* ... */);
}
```

### Tailwind

- Clases Tailwind directas en el template, incluyendo **hex arbitrario inline** (`bg-[#0D9488]`, `text-[#00201B]`, `border-[#E2E8F0]`) mezclado con clases estándar (`teal-*`, `gray-*`, `red-*`). Este es el patrón real del proyecto — no migrar a tokens `@theme` de color sin pedido explícito (ver `DESIGN.md` §2.1).
- Sin archivo de configuración Tailwind — tokens de tipografía en `@theme` dentro de `src/styles.css`. Agregar tokens nuevos ahí, no en un archivo separado.

### Íconos

`lucide-angular`: importar el ícono como valor (`import { Home } from 'lucide-angular'`), asignarlo a una propiedad `protected readonly icX = Home`, y usar `<lucide-icon [img]="icX" [size]="16" />` en el template. No importar íconos sueltos por componente sin asignarlos a una propiedad — es el patrón consistente en `shell.ts`, `login.ts`, `users.ts`.

---

## 6. Disciplina anti-sobreingeniería (Ponytail)

Escalera de decisión antes de escribir código nuevo:

1. ¿Es necesario construir esto? (YAGNI)
2. ¿La librería estándar o Angular ya lo resuelve?
3. ¿Una función nativa de la plataforma lo cubre? Úsala.
4. ¿Una dependencia ya instalada lo resuelve? (`lucide-angular`, Tailwind) Úsala.
5. ¿Se puede resolver en una línea? Hazlo en una línea.
6. Solo entonces: escribe el mínimo código funcional.

Ejemplo real ya aplicado en el proyecto: no hay componente `Button` reutilizable pese a que el patrón de botón se repite en `login.html` — no extraer hasta que un tercer caso lo justifique (ver `DESIGN.md` §7).

No aplicar pereza en: comprensión completa del problema, validación de inputs en fronteras de confianza, seguridad, accesibilidad, y cualquier cosa explícitamente solicitada.

Toda lógica no trivial deja una verificación ejecutable mínima — en la práctica, dado que no hay testing configurado (§7), esto hoy no es exigible mecánicamente; ver §7 para el plan de remediar esto.

---

## 7. Pruebas

**No hay testing funcional en este repositorio** (ver §2). `tsconfig.spec.json` existe pero `angular.json` no declara un target `test`, y no existe ningún `*.spec.ts`.

**PENDIENTE (deuda, no bloqueante hoy):**
- Agregar el builder de test (`@angular/build:unit-test`, Vitest, default en Angular 21) al target `test` de `angular.json`.
- Cobertura prioritaria una vez configurado: lógica de filtrado (`Users.filtered`, `computed()` en screens con búsqueda/filtro), `StatusBadge`/`RoleBadge` (fallback correcto ante status/role desconocido), `Toggle` (`aria-checked` refleja el signal).
- Sin umbral de cobertura definido todavía — no inventar un porcentaje, preguntar al equipo antes de fijarlo.

Hasta que exista testing real, la verificación de un cambio es: `ng build` sin errores + revisión manual en `ng serve`.

---

## 8. Métricas de claridad

Sin linter ni umbrales de complejidad configurados mecánicamente (no hay ESLint). Guía informal por convención ya visible en el código: componentes de `screens/` se mantienen enfocados (lógica de una pantalla, sin mezclar responsabilidades de otra ruta); `shared/` solo para lo reutilizado por 2+ screens.

---

## 9. Gotchas del proyecto

### `font-serif` no carga Gloock

`src/styles.css` declara `--font-serif: 'Gloock', Georgia, 'Times New Roman', serif` pero nunca hace `@import` de Gloock desde Google Fonts (a diferencia de `Frontend-CloudNative`, que sí importa ambas fuentes). Hoy `font-serif` renderiza con el fallback `Georgia`. Ver `DESIGN.md` §1. No corregir de forma reactiva sin que se pida — es una decisión visual, confirmar con el equipo si el look actual (Georgia) es intencional o un descuido de la migración desde el diseño original.

### Target `test` ausente en `angular.json`

Ver §7. `ng test` fallará o no hará nada útil hasta agregarlo.

### Sin autenticación ni guards — no asumir seguridad donde no la hay

`Login.login()` no valida nada; todas las rutas bajo `Shell` son públicas en el código actual. Si se pide agregar autenticación real, es trabajo nuevo, no un fix de bug — no lo hagas de forma proactiva sin que se solicite explícitamente, y al hacerlo sí aplican las reglas de seguridad de A05/A07 (ver `Frontend-CloudNative/AGENTS.md` §6 para el approach planeado de auth allá — Azure Entra ID / OIDC — como referencia de dirección, no como algo ya decidido para este panel).

### `FieldInput` sin asociación `label`/`for`-`id`

Ver `DESIGN.md` §7. Gap de accesibilidad conocido, no bloqueante para el prototipo actual.

### `.codegraph/` existe — usarlo primero

Este proyecto tiene índice CodeGraph. Preferir `codegraph_explore` sobre Read/Grep manual para entender flujos entre `shell.ts` ↔ `screens/*` ↔ `shared/*`.

---

## 10. Seguridad

Prototipo sin backend ni datos reales — superficie de ataque actual es mínima (XSS vía template binding de Angular, que ya sanitiza por defecto; no hay `[innerHTML]` con contenido no confiable en el código actual).

Si se conecta a un backend real en el futuro:

- **A01 Control de acceso roto**: hoy no hay ninguno — implementar guards de ruta por rol antes de conectar a datos reales, no depender de ocultar botones en el cliente.
- **A05 Inyección**: cuando existan llamadas HTTP, usar `HttpClient` con parámetros tipados, nunca construir URLs/queries concatenando input de usuario.
- **A07 Fallos de autenticación**: reemplazar el mock de `Login` por el mecanismo real que defina el equipo (ver gotcha en §9) antes de cualquier despliegue con datos reales.

Nunca commitear secretos, tokens o credenciales. Este repo no tiene `.env` ni variables de entorno todavía — si se agregan, no hardcodear valores en `app.config.ts` ni en ningún componente.

---

## 11. Commits y PR

Conventional Commits (`feat:`, `fix:`, `refactor:`). Rama: `tipo/descripcion-corta`. PR debe indicar qué cambia y por qué, no solo qué archivos.

Nunca agregar trailers/firmas de autoría de agente/IA a un commit ni a un PR (`Co-Authored-By: <agente>`, `<Agente>-Session: <url>`, "Generated with…", enlaces de sesión, o equivalentes), salvo pedido explícito del usuario para ese commit puntual.

Sin esquema Gitmoji definido en este repo — Conventional Commits plano, sin emoji obligatorio.

---

## 12. Límites del agente

**Siempre** (sin pedir permiso): editar código, docs dentro del repo; crear commits locales.

**Preguntar primero**: force-push, `git reset --hard`/`clean`, agregar o actualizar dependencias, cualquier acción que afecte estado compartido (push, PR).

**Nunca sin aprobación explícita**:

- Implementar autenticación real o cambiar el modelo de acceso (ver §9, §10) — es una decisión de arquitectura, no un fix.
- Configuración de CI/CD (no existe hoy — crearla es una decisión del equipo, no una tarea implícita).
- Archivos de secretos o `.env` (no existen hoy).

---

## 13. Enforcement

Este archivo es orientativo, no mecánicamente forzado. No hay pre-commit hooks, ESLint ni CI hoy — el único gate real es `ng build` sin errores y revisión manual. Si el equipo decide agregar ESLint/CI, actualizar esta sección para reflejarlo.

## 14. Mantenimiento

Tratar como código. Añadir una sección cuando el agente falle repetidamente en algo concreto, eliminar cuando la convención cambie (ej. cuando se resuelva el gotcha de `font-serif` o se configure testing). Revisar cada sprint o, en equipos chicos, trimestral.

Si otra herramienta requiere su propio archivo de reglas (`CLAUDE.md`, `.cursorrules`), symlinkearlo a este en vez de duplicar contenido.
