import { AfterViewInit, Directive, ElementRef, OnDestroy, inject, output } from '@angular/core';

/**
 * `<dialog appModal>` renderizado dentro de un `@if`: lo abre con `showModal()`
 * (rol de diálogo, foco atrapado y fondo inerte los da el navegador), avisa con
 * `cerrar` cuando el navegador lo cierra (Esc) para que el `@if` del padre
 * sincronice su estado, y devuelve el foco al elemento que lo abrió, porque
 * sacar el nodo del DOM no lo restaura.
 *
 * Se escucha `close` y no `cancel`: Chrome cierra sin disparar `cancel` si no
 * hubo activación de usuario, y el signal del padre quedaría en "abierto".
 */
@Directive({
  selector: 'dialog[appModal]',
  host: {
    '(close)': 'cerrar.emit()',
  },
})
export class ModalDialog implements AfterViewInit, OnDestroy {
  private readonly el: ElementRef<HTMLDialogElement> = inject(ElementRef);
  private readonly previo = document.activeElement as HTMLElement | null;

  readonly cerrar = output<void>();

  ngAfterViewInit(): void {
    this.el.nativeElement.showModal();
  }

  ngOnDestroy(): void {
    // Tras el render: si el origen desapareció (ej. tarjeta eliminada), el foco
    // iría a <body>; se deja en el contenido principal del shell.
    queueMicrotask(() => {
      const destino = this.previo?.isConnected ? this.previo : document.getElementById('main-content');
      destino?.focus();
    });
  }
}
