import { describe, it, expect } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { FieldInput } from './field-input';

describe('FieldInput', () => {
  it('debe usar un token válido de borde y no el token indefinido border-border-input', () => {
    const component = TestBed.runInInjectionContext(() => new FieldInput());
    expect(component.inputCls()).not.toContain('border-border-input');
    expect(component.inputCls()).toMatch(/border-(border|slate-300)/);
  });
});
