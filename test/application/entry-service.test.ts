import { afterEach, describe, expect, it } from 'vitest';

import { NotFoundError } from '../../src/domain/errors.js';
import { createTestService } from '../helpers/temp-db.js';

describe('EntryService', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    while (cleanups.length > 0) {
      cleanups.pop()?.();
    }
  });

  it('returns timestamps and stable createdAt on update', () => {
    const { service, cleanup } = createTestService();
    cleanups.push(cleanup);

    const created = service.createEntry({
      type: 'company',
      name: 'Bad Corp',
      reason: 'Poor support',
      severity: 'warn',
      incidentDate: '2026-03-27',
    });

    const updated = service.updateEntry(created.id, {
      reason: 'Poor support and deceptive upsells',
    });

    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.updatedAt >= created.updatedAt).toBe(true);
  });

  it('throws when fetching a missing entry', () => {
    const { service, cleanup } = createTestService();
    cleanups.push(cleanup);

    expect(() => service.getEntry('missing')).toThrow(NotFoundError);
  });
});
