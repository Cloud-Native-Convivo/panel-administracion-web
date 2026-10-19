import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CondominiosService } from './condominios.service';

describe('Solicitudes de asignación', () => {
  it('lista pendientes y aprueba por ID mediante el BFF', () => {
    const http = { get: vi.fn().mockReturnValue(of([])), post: vi.fn().mockReturnValue(of({ estado: 'aprobada' })) };
    const service = new CondominiosService(http as unknown as HttpClient);
    service.listarSolicitudes().subscribe();
    service.aprobarSolicitud(7).subscribe();
    expect(http.get).toHaveBeenCalledWith(expect.stringMatching(/\/condominios\/solicitudes$/));
    expect(http.post).toHaveBeenCalledWith(expect.stringMatching(/\/condominios\/solicitudes\/7\/aprobar$/), {});
  });
});
