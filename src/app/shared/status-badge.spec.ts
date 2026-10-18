import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  let fixture: ComponentFixture<StatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadge],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadge);
  });

  it('debe renderizar un punto indicador de estado con animate-pulse', () => {
    fixture.componentRef.setInput('status', 'pagado');
    fixture.detectChanges();
    const dot = fixture.nativeElement.querySelector('span > span');
    expect(dot).not.toBeNull();
    expect(dot.className).toContain('rounded-full');
    expect(dot.className).toContain('animate-pulse');
  });
});
