import { afterEach, describe, expect, it } from 'vitest';

import { buildApp } from '../../src/rest/app.js';
import { createTestService } from '../helpers/temp-db.js';

describe('REST routes', () => {
  const cleanups: Array<() => Promise<void> | void> = [];

  afterEach(async () => {
    while (cleanups.length > 0) {
      await cleanups.pop()?.();
    }
  });

  it('supports CRUD and lookup', async () => {
    const { service, cleanup } = createTestService();
    const app = await buildApp(service);
    cleanups.push(async () => app.close());
    cleanups.push(cleanup);

    const createResponse = await app.inject({
      method: 'POST',
      url: '/entries',
      payload: {
        type: 'company',
        name: 'Bad Corp',
        aliases: ['BadCo'],
        reason: 'Predatory contract renewal',
        tags: ['contracts'],
        evidenceLinks: ['https://example.com/contract'],
        severity: 'blacklisted',
        incidentDate: '2026-03-27',
      },
    });

    expect(createResponse.statusCode).toBe(201);
    const created = createResponse.json();

    const lookupResponse = await app.inject({
      method: 'GET',
      url: '/lookup?name=BadCo',
    });
    expect(lookupResponse.statusCode).toBe(200);
    expect(lookupResponse.json()).toHaveLength(1);

    const getByIdResponse = await app.inject({
      method: 'GET',
      url: `/entries/${created.id}`,
    });
    expect(getByIdResponse.statusCode).toBe(200);
    expect(getByIdResponse.json().name).toBe('Bad Corp');

    const updateResponse = await app.inject({
      method: 'PATCH',
      url: `/entries/${created.id}`,
      payload: {
        severity: 'warn',
      },
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json().severity).toBe('warn');

    const listResponse = await app.inject({
      method: 'GET',
      url: '/entries?severity=warn',
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json()).toHaveLength(1);

    const deleteResponse = await app.inject({
      method: 'DELETE',
      url: `/entries/${created.id}`,
    });
    expect(deleteResponse.statusCode).toBe(204);

    const missingResponse = await app.inject({
      method: 'GET',
      url: `/entries/${created.id}`,
    });
    expect(missingResponse.statusCode).toBe(404);
  });

  it('returns 400 for invalid create payloads', async () => {
    const { service, cleanup } = createTestService();
    const app = await buildApp(service);
    cleanups.push(async () => app.close());
    cleanups.push(cleanup);

    const response = await app.inject({
      method: 'POST',
      url: '/entries',
      payload: {
        type: 'company',
        name: '',
        reason: 'Bad payload',
        severity: 'warn',
        incidentDate: 'not-a-date',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
