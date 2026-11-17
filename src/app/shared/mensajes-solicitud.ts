/** Mensajes comunes de las mutaciones asíncronas que el bff acepta con 202 y un ticket. */

/** El bff respondió 503: no pudo encolar la solicitud. */
export const MENSAJE_SERVICIO_OCUPADO =
  'No se pudo enviar la solicitud: el servicio está ocupado. Intenta nuevamente en unos segundos.';

/** La solicitud se encoló, pero no se pudo conocer su resultado (timeout o error al consultar el job). */
export const MENSAJE_SIN_CONFIRMAR =
  'No se pudo confirmar el resultado de la solicitud. Revisa la lista en unos momentos.';
