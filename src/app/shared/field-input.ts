import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-field-input',
  template: `
    <div>
      <label [for]="inputId()" class="block text-sm font-medium text-[#00201B] mb-1.5">{{ label() }}</label>
      <input
        [id]="inputId()"
        [value]="defaultValue()"
        [disabled]="disabled()"
        [class]="inputCls()"
      />
    </div>
  `,
})
export class FieldInput {
  readonly label = input.required<string>();
  readonly defaultValue = input<string>('');
  readonly disabled = input(false);
  readonly id = input<string>('');

  private readonly autoId = `field-input-${Math.random().toString(36).slice(2, 7)}`;
  readonly inputId = computed(() => this.id() || this.autoId);

  readonly inputCls = computed(() =>
    `w-full py-2.5 px-3.5 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-[#0D9488] transition-colors ${
      this.disabled() ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "bg-white text-[#00201B]"
    }`,
  );
}
