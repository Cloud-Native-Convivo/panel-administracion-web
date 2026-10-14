import { describe, expect, it } from 'vitest';

/**
 * Validador de convención Gitmoji + Conventional Commits para panel-administracion-web.
 * Alineado con pr-quality.yml y AGENTS.md §11.2.
 */
describe('GitCommitConvention', () => {
  const GITMOJI_CONVENTIONAL_PATTERN =
    /^(?::\w+:|[^\w\s:]\S*)\s(\w*)(?:\(([\w$.\-*/ ]*)\))?!?:\s(.*)$/;

  const ALLOWED_TYPES = new Set([
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'perf',
    'test',
    'build',
    'ci',
    'chore',
    'revert',
  ]);

  function isValidCommitMessage(message: string): boolean {
    if (!message || !message.trim()) return false;
    const firstLine = message.trim().split('\n')[0].trim();
    const match = firstLine.match(GITMOJI_CONVENTIONAL_PATTERN);
    if (!match) return false;
    const type = match[1];
    return ALLOWED_TYPES.has(type);
  }

  const validExamples = [
    ':sparkles: feat: nueva vista de panel de administracion',
    '✨ feat(espacios): selector de tarifa por hora',
    ':lock: fix(auth): sanitizar tokens de entra id en guards',
    ':memo: docs(readme): documentar comandos de verificacion local',
    ':white_check_mark: test(gastos): validar estados de conciliacion',
    '🐛 fix(sidebar): colapso responsive en dispositivos moviles',
    ':wrench: chore(deps): actualizar librerias menores',
  ];

  validExamples.forEach((msg) => {
    it(`debe aceptar mensaje valido: ${msg}`, () => {
      expect(isValidCommitMessage(msg)).toBe(true);
    });
  });

  const invalidExamples = [
    'fix: sin gitmoji al inicio',
    ':sparkles: sin tipo convencional',
    'WIP prueba rapida',
    ':sparkles: invalid_type(modulo): descripcion',
    'feat: solo texto',
    '',
  ];

  invalidExamples.forEach((msg) => {
    it(`debe rechazar mensaje invalido: ${msg}`, () => {
      expect(isValidCommitMessage(msg)).toBe(false);
    });
  });
});
