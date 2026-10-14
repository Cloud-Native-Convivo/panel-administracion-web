# PanelAdmin

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.21.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

### Verificación Preventiva Local Pre-push

Antes de abrir un Pull Request o enviar commits al repositorio remoto, validar localmente con el runner nativo:

```bash
# 1. Ejecutar pruebas unitarias y validación Gitmoji
pnpm test

# 2. Compilar aplicación para validar tipos y empaquetado
pnpm run build
```

> **Nota de CI**: `src/app/git-commit-convention.spec.ts` asegura que los mensajes de commit respeten la sintaxis Gitmoji + Conventional Commits (`pr-quality.yml`).

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
