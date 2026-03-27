import { afterEach, describe, expect, it } from 'vitest';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';

import { createMcpServer } from '../../src/mcp/server.js';
import { createTestService } from '../helpers/temp-db.js';

describe('MCP server', () => {
  const cleanups: Array<() => Promise<void> | void> = [];

  afterEach(async () => {
    while (cleanups.length > 0) {
      await cleanups.pop()?.();
    }
  });

  it('registers and executes blacklist tools', async () => {
    const { service, cleanup } = createTestService();
    cleanups.push(cleanup);

    const server = createMcpServer(service);
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

    cleanups.push(() => client.close());
    cleanups.push(() => server.close());

    const listedTools = await client.listTools();
    expect(listedTools.tools.map((tool) => tool.name).sort()).toEqual([
      'createEntry',
      'deleteEntry',
      'listEntries',
      'lookupEntry',
      'updateEntry',
    ]);

    const createResult = await client.callTool({
      name: 'createEntry',
      arguments: {
        type: 'company',
        name: 'Bad Corp',
        aliases: ['BadCo'],
        reason: 'Predatory pricing',
        tags: ['pricing'],
        evidenceLinks: ['https://example.com/pricing'],
        severity: 'blacklisted',
        incidentDate: '2026-03-27',
      },
    });

    const created = createResult.structuredContent as { id: string; name: string };
    expect(created.name).toBe('Bad Corp');

    const lookupResult = await client.callTool({
      name: 'lookupEntry',
      arguments: { name: 'BadCo' },
    });

    const lookupEntries = lookupResult.structuredContent as { entries: Array<{ id: string }> };
    expect(lookupEntries.entries).toHaveLength(1);

    const updateResult = await client.callTool({
      name: 'updateEntry',
      arguments: {
        id: created.id,
        updates: {
          severity: 'warn',
        },
      },
    });
    expect((updateResult.structuredContent as { severity: string }).severity).toBe('warn');

    const deleteResult = await client.callTool({
      name: 'deleteEntry',
      arguments: { id: created.id },
    });
    expect((deleteResult.structuredContent as { success: boolean }).success).toBe(true);

    const listResult = await client.callTool({
      name: 'listEntries',
      arguments: {},
    });
    expect((listResult.structuredContent as { entries: unknown[] }).entries).toHaveLength(0);
  });
});
