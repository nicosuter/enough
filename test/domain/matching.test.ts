import { describe, expect, it } from 'vitest';

import { matchesNameOrAlias } from '../../src/domain/matching.js';

describe('matchesNameOrAlias', () => {
  it('matches exact canonical name and alias', () => {
    expect(matchesNameOrAlias('Bad Corp', ['BadCo'], 'bad corp')).toBe(true);
    expect(matchesNameOrAlias('Bad Corp', ['BadCo'], 'BadCo')).toBe(true);
  });

  it('does not match partial values', () => {
    expect(matchesNameOrAlias('Bad Corp', ['BadCo'], 'Bad')).toBe(false);
  });
});
