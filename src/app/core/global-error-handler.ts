import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: unknown): void {
    // Aquí es donde en el futuro integrarías Sentry, Bugsnag, Datadog, etc.
    const message = error instanceof Error ? error.message : String(error);

    // Evitamos bloquear el hilo principal o ensuciar la consola de producción
    // En desarrollo puedes querer imprimirlo, pero en prod lo enviamos al tracker
    console.error('⚠️ [GlobalErrorHandler] Excepción capturada:', message);

    // Si tuviéramos un servicio de notificaciones (toast), podríamos inyectarlo
    // aquí usando el Injector para mostrar un mensaje amigable al usuario final
    // alert('Ha ocurrido un error inesperado. Por favor, intenta de nuevo.');
  }
}
