import { describe, expect, it } from 'vitest';

import { createEntrySchema, updateEntrySchema } from '../../src/domain/entry-schemas.js';

describe('entry schemas', () => {
  it('accepts a valid create payload', () => {
    const payload = createEntrySchema.parse({
      type: 'company',
      name: 'Bad Corp',
      aliases: ['BadCo'],
      reason: 'Repeated deceptive billing',
      tags: ['billing'],
      evidenceLinks: ['https://example.com/evidence'],
      severity: 'blacklisted',
      incidentDate: '2026-03-27',
      expiresAt: '2026-04-01T00:00:00Z',
    });

    expect(payload.name).toBe('Bad Corp');
  });

  it('rejects an empty update payload', () => {
    expect(() => updateEntrySchema.parse({})).toThrow(/At least one field/);
  });

  it('allows temporary blacklist entries without an expiration date', () => {
    const payload = createEntrySchema.parse({
      type: 'company',
      name: 'Bad Corp',
      reason: 'Repeated deceptive billing',
      severity: 'blacklisted_temporary',
      incidentDate: '2026-03-27',
    });

    expect(payload.severity).toBe('blacklisted_temporary');
    expect(payload.expiresAt).toBeUndefined();
  });
});
