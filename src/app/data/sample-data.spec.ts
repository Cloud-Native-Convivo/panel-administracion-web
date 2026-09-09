import { describe, expect, it } from 'vitest';
import { ini } from './sample-data';

describe('ini', () => {
  it('returns uppercase initials from up to two words', () => {
    expect(ini('Juan Perez')).toBe('JP');
    expect(ini('Ana')).toBe('A');
  });
});
