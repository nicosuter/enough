import { afterEach, describe, expect, it } from 'vitest';

import { createTestDatabase, createTestService } from '../helpers/temp-db.js';

describe('EntryRepository via service', () => {
  const cleanups: Array<() => void> = [];

  afterEach(() => {
    while (cleanups.length > 0) {
      cleanups.pop()?.();
    }
  });

  it('creates, looks up, lists, updates, and deletes entries', () => {
    const { service, cleanup } = createTestService();
    cleanups.push(cleanup);

    const created = service.createEntry({
      type: 'company',
      name: 'Bad Corp',
      aliases: ['BadCo'],
      reason: 'Repeated deceptive billing',
      tags: ['billing'],
      evidenceLinks: ['https://example.com/evidence'],
      severity: 'blacklisted_temporary',
      incidentDate: '2026-03-27',
      expiresAt: '2026-04-01T00:00:00Z',
    });

    expect(service.lookupEntry('BadCo')).toHaveLength(1);
    expect(service.listEntries({ tag: 'billing' })).toHaveLength(1);

    const updated = service.updateEntry(created.id, {
      aliases: ['Bad Corporation'],
      severity: 'blacklisted',
      expiresAt: null,
    });

    expect(updated.aliases).toEqual(['Bad Corporation']);
    expect(updated.severity).toBe('blacklisted');
    expect(updated.expiresAt).toBeUndefined();
    expect(service.lookupEntry('BadCo')).toHaveLength(0);
    expect(service.lookupEntry('Bad Corporation')).toHaveLength(1);

    service.deleteEntry(created.id);

    expect(service.listEntries()).toHaveLength(0);
  });

  it('persists entries across database reopen', () => {
    const { createService, cleanup } = createTestDatabase();
    cleanups.push(cleanup);

    const firstService = createService();
    const created = firstService.createEntry({
      type: 'company',
      name: 'Persisted Corp',
      aliases: ['PersistedCo'],
      reason: 'Keeps adding hidden charges',
      tags: ['billing'],
      evidenceLinks: ['https://example.com/persisted'],
      severity: 'blacklisted',
      incidentDate: '2026-03-27',
    });

    const firstRead = firstService.getEntry(created.id);
    expect(firstRead.name).toBe('Persisted Corp');

    const reopenedService = createService();
    const reopenedRead = reopenedService.getEntry(created.id);

    expect(reopenedRead.name).toBe('Persisted Corp');
    expect(reopenedService.lookupEntry('PersistedCo')).toHaveLength(1);
  });
});
