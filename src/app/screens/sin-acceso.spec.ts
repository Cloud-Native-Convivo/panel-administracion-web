import { TestBed } from '@angular/core/testing';
import { MsalService } from '@azure/msal-angular';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SinAcceso } from './sin-acceso';

describe('SinAcceso', () => {
  const mockMsal = { logoutRedirect: vi.fn() };

  beforeEach(() => {
    mockMsal.logoutRedirect.mockClear();
    TestBed.configureTestingModule({
      providers: [{ provide: MsalService, useValue: mockMsal }],
    });
  });

  it('muestra el aviso y un botón para cerrar sesión', () => {
    const fixture = TestBed.createComponent(SinAcceso);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Sin acceso');
    expect(el.querySelector('button')?.textContent).toContain('Cerrar sesión');
  });

  it('cierra la sesión al pulsar el botón', () => {
    const fixture = TestBed.createComponent(SinAcceso);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    expect(mockMsal.logoutRedirect).toHaveBeenCalledOnce();
  });
});
