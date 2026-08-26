import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-toggle',
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="value()"
      (click)="change.emit()"
      [class]="btnCls()"
    >
      <span [class]="knobCls()"></span>
    </button>
  `,
})
export class Toggle {
  readonly value = input(false);
  readonly change = output<void>();

  readonly btnCls = computed(() =>
    `relative w-10 h-6 rounded-full transition-colors duration-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0D9488] ${
      this.value() ? "bg-[#0D9488]" : "bg-gray-200"
    }`,
  );

  readonly knobCls = computed(() =>
    `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
      this.value() ? "translate-x-4" : "translate-x-0"
    }`,
  );
}
