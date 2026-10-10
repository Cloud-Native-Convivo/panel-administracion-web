import { describe, it, expect } from 'vitest';
import { NAV_ITEMS } from './shell';

describe('Shell Navigation Items', () => {
  it('no debe exponer rutas fuera de alcance MVP (condominios, users)', () => {
    const ids = NAV_ITEMS.map((item) => item.id);
    expect(ids).not.toContain('condominios');
    expect(ids).not.toContain('users');
  });
});
