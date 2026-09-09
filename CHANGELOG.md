# Changelog

Todas las modificaciones notables de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/),
y este proyecto sigue [Versionado Semántico](https://semver.org/lang/es/).

## [1.2.0] - 2026-09-09

### Added

- `authGuard` funcional sobre `MsalService` en la ruta raíz/Shell (TD-28).
- Target `test` en `angular.json` (builder `@angular/build:unit-test`,
  runner vitest) — antes `ng test` fallaba con "Cannot determine project
  or target for command", sin ningún archivo `*.spec.ts` en el repo.

### Changed

- `apiEspaciosUrl` reconfigurado al puerto 3000 del BFF, ya no pega
  directo a `ms-espacios-comunes:8082` (TD-27).
- Gestor de paquetes migrado de npm a pnpm (`package-lock.json` →
  `pnpm-lock.yaml`) — npm tenía un bug de resolución de peer deps
  (angular/angular#67547, npm/cli#3782, npm/cli#8059) que bloqueaba
  actualizar el core de Angular.
- Angular core (`common`/`compiler`/`compiler-cli`/`core`/`forms`/
  `platform-browser`/`router`) actualizado a 21.2.22, `@angular/cli` y
  `@angular/build` a 21.2.23.
- `@azure/msal-angular` actualizado a 6.2.0.

## [1.1.0] - 2026-09-07

### Added

- Integración con microservicio de reservas y confirmación de pago.
- Sincronización reactiva de KPIs de espacios con base de datos.
- Soporte de teclado y navegación accesible en tarjetas KPI.

### Removed

- Mocks residuales en `sample-data` para el dominio de espacios.

## [1.0.0] - 2026-09-05

### Added

- Adaptación completa del panel web a estrategia Mobile First.
